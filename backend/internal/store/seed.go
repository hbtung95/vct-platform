package store

func SeedData() map[string]map[string]map[string]any {
	entities := map[string][]map[string]any{
		"teams": {
			{
				"id":          "DV01",
				"ma":          "BD",
				"ten":         "Đoàn Bình Định",
				"tat":         "BĐ",
				"loai":        "doan_tinh",
				"tinh":        "Bình Định",
				"truong_doan": "Nguyễn Văn Trọng",
				"sdt":         "0900000001",
				"email":       "bd@vct.vn",
				"trang_thai":  "da_xac_nhan",
			},
			{
				"id":          "DV02",
				"ma":          "HN",
				"ten":         "Đoàn Hà Nội",
				"tat":         "HN",
				"loai":        "doan_tinh",
				"tinh":        "Hà Nội",
				"truong_doan": "Trần Tuấn Anh",
				"sdt":         "0900000002",
				"email":       "hn@vct.vn",
				"trang_thai":  "da_xac_nhan",
			},
		},
		"athletes": {
			{
				"id":         "VDV01",
				"ho_ten":     "Phạm Hoàng Nam",
				"gioi":       "nam",
				"doan_id":    "DV01",
				"doan_ten":   "BĐ",
				"can_nang":   55,
				"trang_thai": "du_dieu_kien",
			},
			{
				"id":         "VDV02",
				"ho_ten":     "Lê Thu Hương",
				"gioi":       "nu",
				"doan_id":    "DV02",
				"doan_ten":   "HN",
				"can_nang":   50,
				"trang_thai": "du_dieu_kien",
			},
		},
		"registration": {
			{
				"id":         "DK01",
				"vdv_id":     "VDV01",
				"vdv_ten":    "Phạm Hoàng Nam",
				"doan_id":    "DV01",
				"doan_ten":   "BĐ",
				"loai":       "doi_khang",
				"nd_id":      "HC55",
				"nd_ten":     "Nam 55kg",
				"trang_thai": "da_duyet",
			},
		},
		"results": {
			{
				"id":         "RS01",
				"loai":       "doi_khang",
				"noi_dung":   "Nam 55kg",
				"vdv_ten":    "Phạm Hoàng Nam",
				"doan":       "BĐ",
				"ket_qua":    "Thắng điểm",
				"diem":       "5:2",
				"huy_chuong": "",
			},
		},
		"schedule": {
			{
				"id":           "L01",
				"ngay":         "2026-08-15",
				"phien":        "sang",
				"gio_bat_dau":  "08:00",
				"gio_ket_thuc": "11:30",
				"san_id":       "S01",
				"noi_dung":     "Nam 55kg",
				"so_tran":      8,
				"trang_thai":   "xac_nhan",
			},
		},
		"arenas": {
			{
				"id":         "S01",
				"ten":        "Sàn 1",
				"vi_tri":     "Nhà thi đấu A",
				"loai":       "doi_khang",
				"trang_thai": "san_sang",
			},
			{
				"id":         "S02",
				"ten":        "Sàn 2",
				"vi_tri":     "Nhà thi đấu A",
				"loai":       "quyen",
				"trang_thai": "san_sang",
			},
		},
		"referees": {
			{
				"id":         "TT01",
				"ho_ten":     "Đặng Quốc Minh",
				"cap_bac":    "quoc_gia",
				"chuyen_mon": "ca_hai",
				"trang_thai": "xac_nhan",
			},
			{
				"id":         "TT02",
				"ho_ten":     "Võ Hải Yến",
				"cap_bac":    "cap_1",
				"chuyen_mon": "quyen",
				"trang_thai": "xac_nhan",
			},
		},
		"appeals": {
			{
				"id":            "KN01",
				"doan_id":       "DV02",
				"doan_ten":      "Đoàn Hà Nội",
				"loai":          "khieu_nai",
				"trang_thai":    "dang_xu_ly",
				"ly_do":         "Đề nghị xem lại điểm kỹ thuật",
				"thoi_gian_nop": "2026-08-15T10:20:00+07:00",
			},
		},
		"weigh-ins": {
			{
				"id":          "CAN01",
				"vdv_id":      "VDV01",
				"vdv_ten":     "Phạm Hoàng Nam",
				"doan_ten":    "BĐ",
				"hang_can_dk": "Nam 55kg",
				"can_thuc_te": 54.8,
				"ket_qua":     "dat",
			},
		},
		"combat-matches": {
			{
				"id":         "TD01",
				"san_id":     "S01",
				"hang_can":   "Nam 55kg",
				"trang_thai": "chua_dau",
				"vdv_do": map[string]any{
					"id":   "VDV01",
					"ten":  "Phạm Hoàng Nam",
					"doan": "BĐ",
				},
				"vdv_xanh": map[string]any{
					"id":   "VDV02",
					"ten":  "Lê Thu Hương",
					"doan": "HN",
				},
			},
		},
		"form-performances": {
			{
				"id":         "Q01",
				"san_id":     "S02",
				"vdv_id":     "VDV02",
				"vdv_ten":    "Lê Thu Hương",
				"doan_ten":   "HN",
				"noi_dung":   "Ngọc Trản Quyền",
				"diem":       []float64{8.8, 8.9, 9.0, 8.7, 8.9},
				"diem_tb":    8.86,
				"xep_hang":   1,
				"trang_thai": "da_cham",
			},
		},
		"content-categories": {
			{
				"id":         "NDQ01",
				"ten":        "Ngọc Trản Quyền",
				"hinh_thuc":  "ca_nhan",
				"gioi":       "nu",
				"lua_tuoi":   "Thanh niên",
				"trang_thai": "active",
			},
			{
				"id":         "HC55",
				"ten":        "Nam 55kg",
				"loai":       "doi_khang",
				"gioi":       "nam",
				"trang_thai": "active",
			},
		},
		"referee-assignments": {
			{
				"id":      "PA01",
				"tt_id":   "TT01",
				"san_id":  "S01",
				"vai_tro": "chinh",
				"ngay":    "2026-08-15",
				"phien":   "sang",
			},
		},
		"tournament-config": {
			{
				"id":              "TOURNAMENT-2026",
				"ten_giai":        "Giải Vô Địch Võ Cổ Truyền Toàn Quốc 2026",
				"ma_giai":         "VCT-2026",
				"cap_do":          "quoc_gia",
				"ngay_bat_dau":    "2026-08-15",
				"ngay_ket_thuc":   "2026-08-20",
				"dia_diem":        "Nhà thi đấu Quy Nhơn",
				"trang_thai":      "dang_ky",
				"operation_shift": "sang",
			},
		},
	}

	seed := make(map[string]map[string]map[string]any, len(entities))
	for entity, items := range entities {
		seed[entity] = make(map[string]map[string]any, len(items))
		for _, item := range items {
			id, ok := item["id"].(string)
			if !ok || id == "" {
				continue
			}
			seed[entity][id] = cloneMap(item)
		}
	}
	return seed
}
