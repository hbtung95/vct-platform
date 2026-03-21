// Package worker provides a background job processing pool with configurable
// concurrency, graceful drain, retry on failure, and dead-letter queue.
package worker

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"sync/atomic"
	"time"
)

// ═══════════════════════════════════════════════════════════════
// Job
// ═══════════════════════════════════════════════════════════════

// Job represents a unit of work.
type Job struct {
	ID        string            `json:"id"`
	Type      string            `json:"type"`
	Payload   map[string]string `json:"payload"`
	MaxRetry  int               `json:"max_retry"`
	Attempt   int               `json:"attempt"`
	CreatedAt time.Time         `json:"created_at"`
}

// ═══════════════════════════════════════════════════════════════
// Handler
// ═══════════════════════════════════════════════════════════════

// Handler processes a job.
type Handler func(ctx context.Context, job *Job) error

// ═══════════════════════════════════════════════════════════════
// Pool
// ═══════════════════════════════════════════════════════════════

// Pool manages a set of workers processing jobs from a queue.
type Pool struct {
	queue      chan *Job
	handlers   map[string]Handler
	deadLetter []*DeadJob
	logger     *slog.Logger
	workers    int
	wg         sync.WaitGroup
	mu         sync.Mutex
	seq        atomic.Uint64

	// Stats
	processed atomic.Int64
	failed    atomic.Int64
	retried   atomic.Int64
}

// DeadJob is a job that exhausted all retries.
type DeadJob struct {
	Job       *Job      `json:"job"`
	Error     string    `json:"error"`
	FailedAt  time.Time `json:"failed_at"`
}

// Config for the worker pool.
type Config struct {
	Workers   int // Number of concurrent workers
	QueueSize int // Max jobs in queue
}

// NewPool creates a worker pool.
func NewPool(cfg Config, logger *slog.Logger) *Pool {
	if cfg.Workers <= 0 {
		cfg.Workers = 4
	}
	if cfg.QueueSize <= 0 {
		cfg.QueueSize = 100
	}

	return &Pool{
		queue:    make(chan *Job, cfg.QueueSize),
		handlers: make(map[string]Handler),
		workers:  cfg.Workers,
		logger:   logger.With(slog.String("component", "worker-pool")),
	}
}

// Handle registers a handler for a job type.
func (p *Pool) Handle(jobType string, handler Handler) {
	p.mu.Lock()
	p.handlers[jobType] = handler
	p.mu.Unlock()
}

// Submit enqueues a job for processing.
// Returns error if queue is full.
func (p *Pool) Submit(job *Job) error {
	if job.ID == "" {
		job.ID = fmt.Sprintf("job-%d", p.seq.Add(1))
	}
	if job.CreatedAt.IsZero() {
		job.CreatedAt = time.Now().UTC()
	}
	if job.MaxRetry <= 0 {
		job.MaxRetry = 3
	}

	select {
	case p.queue <- job:
		return nil
	default:
		return fmt.Errorf("worker pool queue full (capacity: %d)", cap(p.queue))
	}
}

// Start launches worker goroutines.
func (p *Pool) Start(ctx context.Context) {
	for i := 0; i < p.workers; i++ {
		p.wg.Add(1)
		go p.worker(ctx, i)
	}
	p.logger.Info("pool started", "workers", p.workers, "queue_size", cap(p.queue))
}

// Stop drains the queue and waits for workers to finish.
func (p *Pool) Stop() {
	close(p.queue)
	p.wg.Wait()
	p.logger.Info("pool stopped",
		"processed", p.processed.Load(),
		"failed", p.failed.Load(),
	)
}

func (p *Pool) worker(ctx context.Context, id int) {
	defer p.wg.Done()

	for job := range p.queue {
		p.processJob(ctx, job)
	}
}

func (p *Pool) processJob(ctx context.Context, job *Job) {
	p.mu.Lock()
	handler, ok := p.handlers[job.Type]
	p.mu.Unlock()

	if !ok {
		p.logger.Warn("no handler for job type", "type", job.Type, "id", job.ID)
		p.sendToDeadLetter(job, "no handler registered")
		return
	}

	job.Attempt++
	err := handler(ctx, job)

	if err == nil {
		p.processed.Add(1)
		return
	}

	// Retry or dead-letter
	if job.Attempt < job.MaxRetry {
		p.retried.Add(1)
		p.logger.Warn("job failed, retrying",
			"id", job.ID, "type", job.Type,
			"attempt", job.Attempt, "max", job.MaxRetry,
			"error", err,
		)
		// Re-enqueue for retry
		select {
		case p.queue <- job:
		default:
			p.sendToDeadLetter(job, "retry failed: queue full")
		}
		return
	}

	p.failed.Add(1)
	p.sendToDeadLetter(job, err.Error())
}

func (p *Pool) sendToDeadLetter(job *Job, errMsg string) {
	p.mu.Lock()
	p.deadLetter = append(p.deadLetter, &DeadJob{
		Job:      job,
		Error:    errMsg,
		FailedAt: time.Now().UTC(),
	})
	p.mu.Unlock()
	p.logger.Error("job sent to dead letter", "id", job.ID, "type", job.Type, "error", errMsg)
}

// ═══════════════════════════════════════════════════════════════
// Stats & Inspection
// ═══════════════════════════════════════════════════════════════

// Stats returns pool statistics.
type Stats struct {
	Workers    int   `json:"workers"`
	QueueLen   int   `json:"queue_length"`
	QueueCap   int   `json:"queue_capacity"`
	Processed  int64 `json:"processed"`
	Failed     int64 `json:"failed"`
	Retried    int64 `json:"retried"`
	DeadLetter int   `json:"dead_letter"`
}

func (p *Pool) Stats() Stats {
	p.mu.Lock()
	dlCount := len(p.deadLetter)
	p.mu.Unlock()

	return Stats{
		Workers:    p.workers,
		QueueLen:   len(p.queue),
		QueueCap:   cap(p.queue),
		Processed:  p.processed.Load(),
		Failed:     p.failed.Load(),
		Retried:    p.retried.Load(),
		DeadLetter: dlCount,
	}
}

// DeadLetterQueue returns all dead-lettered jobs.
func (p *Pool) DeadLetterQueue() []*DeadJob {
	p.mu.Lock()
	defer p.mu.Unlock()
	result := make([]*DeadJob, len(p.deadLetter))
	copy(result, p.deadLetter)
	return result
}

// Pending returns current queue depth.
func (p *Pool) Pending() int {
	return len(p.queue)
}
