package db

import "embed"

//go:embed migrations/*.sql seeds/shared/*.sql seeds/dev/*.sql
var FS embed.FS
