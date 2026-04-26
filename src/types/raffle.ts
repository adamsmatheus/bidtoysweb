export type RifaStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'READY_TO_START'
  | 'ACTIVE'
  | 'FINISHED'
  | 'CANCELLED'

export interface RifaImageResponse {
  id: string
  fileUrl: string
  position: number
}

export interface RifaCompany {
  id: string
  name: string
  logoUrl: string | null
  pixKey: string | null
}

export interface RifaTicketResponse {
  ticketNumber: number
  buyerId: string | null
  buyerName: string | null
  purchasedAt: string | null
}

export interface RifaResponse {
  id: string
  sellerId: string
  sellerName: string
  title: string
  description: string | null
  ticketPriceAmount: number
  totalTickets: number
  soldTickets: number
  drawDate: string
  status: RifaStatus
  winnerTicketNumber: number | null
  winnerUserId: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
  images: RifaImageResponse[]
  company: RifaCompany | null
  tickets: RifaTicketResponse[]
}

export interface CreateRifaRequest {
  title: string
  description?: string
  ticketPriceAmount: number
  totalTickets: number
  drawDate: string
}

export interface UpdateRifaRequest {
  title?: string
  description?: string
  ticketPriceAmount?: number
  totalTickets?: number
  drawDate?: string
}

export interface BuyTicketsRequest {
  ticketNumbers: number[]
}

export interface DeclareWinnerRequest {
  winnerTicketNumber: number
}
