FROM golang:1.26 AS builder
WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/vct-backend ./cmd/server

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /out/vct-backend /app/vct-backend
EXPOSE 18080
ENTRYPOINT ["/app/vct-backend"]
