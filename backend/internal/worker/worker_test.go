package worker

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"sync/atomic"
	"testing"
	"time"
)

func testLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelError}))
}

func TestSubmitAndProcess(t *testing.T) {
	pool := NewPool(Config{Workers: 2, QueueSize: 10}, testLogger())
	var processed atomic.Int32

	pool.Handle("email", func(ctx context.Context, job *Job) error {
		processed.Add(1)
		return nil
	})

	pool.Start(context.Background())
	pool.Submit(&Job{Type: "email", Payload: map[string]string{"to": "user@test.com"}})
	pool.Submit(&Job{Type: "email", Payload: map[string]string{"to": "admin@test.com"}})

	time.Sleep(50 * time.Millisecond)
	pool.Stop()

	if processed.Load() != 2 {
		t.Errorf("expected 2 processed, got %d", processed.Load())
	}
}

func TestAutoID(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 10}, testLogger())
	pool.Handle("test", func(ctx context.Context, job *Job) error { return nil })

	j1 := &Job{Type: "test"}
	j2 := &Job{Type: "test"}
	pool.Submit(j1)
	pool.Submit(j2)

	if j1.ID == j2.ID {
		t.Error("should have unique IDs")
	}
}

func TestQueueFull(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 1}, testLogger())

	pool.Submit(&Job{Type: "test"})
	err := pool.Submit(&Job{Type: "test"})

	if err == nil {
		t.Error("expected queue full error")
	}
}

func TestRetryOnFailure(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 10}, testLogger())
	var attempts atomic.Int32

	pool.Handle("flaky", func(ctx context.Context, job *Job) error {
		n := attempts.Add(1)
		if n < 3 {
			return errors.New("temporary error")
		}
		return nil
	})

	pool.Start(context.Background())
	pool.Submit(&Job{Type: "flaky", MaxRetry: 3})

	time.Sleep(100 * time.Millisecond)
	pool.Stop()

	if attempts.Load() < 3 {
		t.Errorf("expected at least 3 attempts, got %d", attempts.Load())
	}

	stats := pool.Stats()
	if stats.Processed < 1 {
		t.Error("should have eventually succeeded")
	}
}

func TestDeadLetterQueue(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 10}, testLogger())

	pool.Handle("always-fail", func(ctx context.Context, job *Job) error {
		return errors.New("permanent failure")
	})

	pool.Start(context.Background())
	pool.Submit(&Job{Type: "always-fail", MaxRetry: 1})

	time.Sleep(50 * time.Millisecond)
	pool.Stop()

	dlq := pool.DeadLetterQueue()
	if len(dlq) != 1 {
		t.Errorf("expected 1 dead letter, got %d", len(dlq))
	}
	if dlq[0].Error != "permanent failure" {
		t.Error("error message mismatch")
	}
}

func TestNoHandler(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 10}, testLogger())

	pool.Start(context.Background())
	pool.Submit(&Job{Type: "unknown"})

	time.Sleep(50 * time.Millisecond)
	pool.Stop()

	dlq := pool.DeadLetterQueue()
	if len(dlq) != 1 {
		t.Errorf("expected 1 dead letter for unknown type, got %d", len(dlq))
	}
}

func TestStats(t *testing.T) {
	pool := NewPool(Config{Workers: 4, QueueSize: 50}, testLogger())
	pool.Handle("test", func(ctx context.Context, job *Job) error { return nil })

	pool.Start(context.Background())
	for i := 0; i < 5; i++ {
		pool.Submit(&Job{Type: "test"})
	}
	time.Sleep(50 * time.Millisecond)
	pool.Stop()

	stats := pool.Stats()
	if stats.Workers != 4 {
		t.Errorf("expected 4 workers, got %d", stats.Workers)
	}
	if stats.Processed != 5 {
		t.Errorf("expected 5 processed, got %d", stats.Processed)
	}
}

func TestGracefulDrain(t *testing.T) {
	pool := NewPool(Config{Workers: 1, QueueSize: 10}, testLogger())
	var count atomic.Int32

	pool.Handle("slow", func(ctx context.Context, job *Job) error {
		time.Sleep(10 * time.Millisecond)
		count.Add(1)
		return nil
	})

	pool.Start(context.Background())
	for i := 0; i < 5; i++ {
		pool.Submit(&Job{Type: "slow"})
	}

	// Stop should drain remaining jobs
	pool.Stop()

	if count.Load() != 5 {
		t.Errorf("expected all 5 drained, got %d", count.Load())
	}
}
