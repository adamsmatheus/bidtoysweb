import http from './http'

export const reportApi = {
  submit: (reportedUserId: string, reason: string, images: File[]) => {
    const form = new FormData()
    form.append('reason', reason)
    images.forEach((img) => form.append('images', img))
    return http.post(`/buyer-reports/${reportedUserId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
