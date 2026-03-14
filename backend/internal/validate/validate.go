package validate

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"regexp"
	"strings"
)

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — INPUT VALIDATION MIDDLEWARE
// Struct tag validation with standardized error responses.
// Tags: required, min, max, email, oneof
// ═══════════════════════════════════════════════════════════════

// FieldError represents a single field validation error.
type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Tag     string `json:"tag"`
}

// ValidationError is returned when input validation fails.
type ValidationError struct {
	Code    string       `json:"code"`
	Message string       `json:"message"`
	Errors  []FieldError `json:"errors"`
}

func (e *ValidationError) Error() string {
	return e.Message
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Struct validates a struct based on `validate` tags.
// Supported tags: required, min=N, max=N, email, oneof=a|b|c
func Struct(s interface{}) *ValidationError {
	v := reflect.ValueOf(s)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		return nil
	}

	t := v.Type()
	var errors []FieldError

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		value := v.Field(i)
		tag := field.Tag.Get("validate")
		if tag == "" || tag == "-" {
			continue
		}

		// Get JSON field name for error messages
		jsonName := field.Tag.Get("json")
		if jsonName == "" || jsonName == "-" {
			jsonName = strings.ToLower(field.Name)
		}
		jsonName = strings.Split(jsonName, ",")[0]

		rules := strings.Split(tag, ",")
		for _, rule := range rules {
			rule = strings.TrimSpace(rule)
			if err := validateRule(jsonName, value, rule); err != nil {
				errors = append(errors, *err)
			}
		}
	}

	if len(errors) > 0 {
		return &ValidationError{
			Code:    "VALIDATION_ERROR",
			Message: fmt.Sprintf("Dữ liệu không hợp lệ: %d lỗi", len(errors)),
			Errors:  errors,
		}
	}
	return nil
}

func validateRule(field string, value reflect.Value, rule string) *FieldError {
	switch {
	case rule == "required":
		if isZero(value) {
			return &FieldError{Field: field, Message: fmt.Sprintf("%s là bắt buộc", field), Tag: "required"}
		}

	case strings.HasPrefix(rule, "min="):
		minStr := strings.TrimPrefix(rule, "min=")
		var minVal int
		fmt.Sscanf(minStr, "%d", &minVal)
		switch value.Kind() {
		case reflect.String:
			if len(value.String()) < minVal {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s phải có ít nhất %d ký tự", field, minVal), Tag: "min"}
			}
		case reflect.Int, reflect.Int64:
			if value.Int() < int64(minVal) {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s phải lớn hơn hoặc bằng %d", field, minVal), Tag: "min"}
			}
		case reflect.Slice, reflect.Array:
			if value.Len() < minVal {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s cần ít nhất %d phần tử", field, minVal), Tag: "min"}
			}
		}

	case strings.HasPrefix(rule, "max="):
		maxStr := strings.TrimPrefix(rule, "max=")
		var maxVal int
		fmt.Sscanf(maxStr, "%d", &maxVal)
		switch value.Kind() {
		case reflect.String:
			if len(value.String()) > maxVal {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s không được quá %d ký tự", field, maxVal), Tag: "max"}
			}
		case reflect.Int, reflect.Int64:
			if value.Int() > int64(maxVal) {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s phải nhỏ hơn hoặc bằng %d", field, maxVal), Tag: "max"}
			}
		}

	case rule == "email":
		if value.Kind() == reflect.String && value.String() != "" && !emailRegex.MatchString(value.String()) {
			return &FieldError{Field: field, Message: fmt.Sprintf("%s phải là email hợp lệ", field), Tag: "email"}
		}

	case strings.HasPrefix(rule, "oneof="):
		allowed := strings.Split(strings.TrimPrefix(rule, "oneof="), "|")
		if value.Kind() == reflect.String {
			val := value.String()
			found := false
			for _, a := range allowed {
				if val == a {
					found = true
					break
				}
			}
			if !found && val != "" {
				return &FieldError{Field: field, Message: fmt.Sprintf("%s phải là một trong: %s", field, strings.Join(allowed, ", ")), Tag: "oneof"}
			}
		}
	}
	return nil
}

func isZero(v reflect.Value) bool {
	switch v.Kind() {
	case reflect.String:
		return strings.TrimSpace(v.String()) == ""
	case reflect.Int, reflect.Int64:
		return v.Int() == 0
	case reflect.Float64:
		return v.Float() == 0
	case reflect.Bool:
		return !v.Bool()
	case reflect.Ptr, reflect.Interface:
		return v.IsNil()
	case reflect.Slice, reflect.Array:
		return v.Len() == 0
	default:
		return false
	}
}

// ── HTTP Helpers ─────────────────────────────────────────────

// RequestBody decodes JSON body and validates it. Returns 422 on failure.
func RequestBody(w http.ResponseWriter, r *http.Request, dest interface{}) bool {
	if err := json.NewDecoder(r.Body).Decode(dest); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"code":    "INVALID_JSON",
			"message": "Request body không phải JSON hợp lệ",
			"detail":  err.Error(),
		})
		return false
	}

	if vErr := Struct(dest); vErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		json.NewEncoder(w).Encode(vErr)
		return false
	}

	return true
}
