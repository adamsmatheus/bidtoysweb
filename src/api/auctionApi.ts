import http from './http'
import type {
  AuctionImageResponse,
  AuctionResponse,
  AuctionStatus,
  BuyerSummaryResponse,
  CreateAuctionRequest,
  UpdateAuctionRequest,
  CancelAuctionRequest,
  ShipmentStatus,
  UpdateShipmentStatusRequest,
  DisputeMessageResponse,
} from '@/types/auction'
import type { PageResponse } from '@/types/bid'

export const auctionApi = {
  list: (params?: { status?: AuctionStatus; page?: number; size?: number; sellerId?: string; shipmentStatus?: ShipmentStatus }) =>
    http.get<PageResponse<AuctionResponse>>('/auctions', { params }).then((r) => r.data),

  get: (id: string) =>
    http.get<AuctionResponse>(`/auctions/${id}`).then((r) => r.data),

  create: (data: CreateAuctionRequest) =>
    http.post<AuctionResponse>('/auctions', data).then((r) => r.data),

  update: (id: string, data: UpdateAuctionRequest) =>
    http.put<AuctionResponse>(`/auctions/${id}`, data).then((r) => r.data),

  submit: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/submit`).then((r) => r.data),

  start: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/start`).then((r) => r.data),

  cancel: (id: string, data?: CancelAuctionRequest) =>
    http.post<AuctionResponse>(`/auctions/${id}/cancel`, data ?? {}).then((r) => r.data),

  uploadImage: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http
      .post<AuctionImageResponse>(`/auctions/${id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete: (id: string) =>
    http.delete(`/auctions/${id}`),

  deleteImage: (id: string, imageId: string) =>
    http.delete(`/auctions/${id}/images/${imageId}`),

  setCoverImage: (id: string, imageId: string) =>
    http.put(`/auctions/${id}/images/${imageId}/cover`),

  listWon: (params?: { status?: AuctionStatus; holdShipment?: boolean; page?: number; size?: number }) =>
    http.get<PageResponse<AuctionResponse>>('/auctions/won', { params }).then((r) => r.data),

  listMyBuyers: () =>
    http.get<BuyerSummaryResponse[]>('/auctions/my-buyers').then((r) => r.data),

  uploadPaymentReceipt: (id: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http
      .post<{ receiptUrl: string }>(`/auctions/${id}/payment-receipt`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  declarePayment: (id: string, holdShipment: boolean, receiptUrl?: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/declare-payment`, { holdShipment, receiptUrl }).then((r) => r.data),

  confirmPayment: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/confirm-payment`).then((r) => r.data),

  disputePayment: (id: string, reason: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/dispute-payment`, { reason }).then((r) => r.data),

  listDisputeMessages: (id: string) =>
    http.get<DisputeMessageResponse[]>(`/auctions/${id}/dispute-messages`).then((r) => r.data),

  sendDisputeMessage: (id: string, message: string) =>
    http.post<DisputeMessageResponse>(`/auctions/${id}/dispute-messages`, { message }).then((r) => r.data),

  updateShipmentStatus: (id: string, data: UpdateShipmentStatusRequest) =>
    http.patch<AuctionResponse>(`/auctions/${id}/shipment-status`, data).then((r) => r.data),

  requestDelivery: (id: string) =>
    http.post<AuctionResponse>(`/auctions/${id}/request-delivery`).then((r) => r.data),

  reportAuction: (id: string, reason: string) =>
    http.post(`/auction-reports/${id}`, { reason }).then((r) => r.data),
}
