import { expect, test } from '@playwright/test'
import { writeFileSync } from 'node:fs'

const loginAsAdmin = async (page) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Vào hệ thống điều hành' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

test('Core workflow: team -> athlete -> registration -> result', async ({
  page,
}, testInfo) => {
  const stamp = Date.now()
  const teamName = `E2E Team ${stamp}`
  const athleteName = `E2E Athlete ${stamp}`

  await loginAsAdmin(page)

  await page.goto('/teams')
  await page.locator('button:has-text("Thêm đơn vị")').first().click()
  await page
    .getByPlaceholder('VD: CLB Võ cổ truyền Bình Định')
    .fill(teamName)
  await page.getByPlaceholder('VD: BD-001').fill(`E2E-${stamp}`)
  await page.locator('button:has-text("Thêm mới")').first().click()
  await expect(page.getByText(teamName, { exact: true }).first()).toBeVisible()

  const csvPath = testInfo.outputPath(`athletes-${stamp}.csv`)
  writeFileSync(
    csvPath,
    [
      'id,ho_ten,gioi,ngay_sinh,can_nang,chieu_cao,doan_id,doan_ten,nd_quyen,nd_dk,trang_thai,kham_sk,bao_hiem,anh,cmnd',
      `E2E-V-${stamp},${athleteName},nam,2006-03-01,52,170,D01,Bình Định,Q01,HC01,cho_xac_nhan,true,true,true,true`,
    ].join('\n'),
    'utf8'
  )

  await page.goto('/athletes')
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Import CSV/JSON' }).click(),
  ])
  await fileChooser.setFiles(csvPath)
  await expect(page.getByText(athleteName, { exact: true }).first()).toBeVisible()

  await page.goto('/registration')
  await page.getByRole('button', { name: 'Quản lý Thẻ (In-card)' }).click()
  await page.getByText(athleteName).first().click()
  await page.locator('input[type="checkbox"]').first().check()
  await page.getByRole('button', { name: 'Lưu Hồ Sơ Đăng Ký' }).click()
  await expect(page.getByText(athleteName, { exact: true }).first()).toBeVisible()

  await page.goto('/results')
  await page.getByRole('button', { name: 'Nhập kết quả' }).click()
  await page.getByPlaceholder('VD: Nam 52-56kg 16-18').fill('Nam 52-56kg 16-18')
  await page.getByPlaceholder('Họ tên VĐV').fill(athleteName)
  await page.getByPlaceholder('Tên đoàn').fill('Bình Định')
  await page.getByPlaceholder('VD: Hạng 1').fill('Hạng 1')
  await page.getByPlaceholder('VD: 8.50').fill('8.75')
  await page.getByRole('button', { name: 'Lưu kết quả' }).click()

  await expect(page.getByText(athleteName, { exact: true }).first()).toBeVisible()
})
