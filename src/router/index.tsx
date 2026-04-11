import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'

import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { AuctionListPage } from '@/pages/auctions/AuctionListPage'
import { AuctionDetailPage } from '@/pages/auctions/AuctionDetailPage'
import { CreateEditAuctionPage } from '@/pages/auctions/CreateEditAuctionPage'
import { MyAuctionsPage } from '@/pages/auctions/MyAuctionsPage'
import { MyWinsPage } from '@/pages/auctions/MyWinsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { PendingAuctionsPage } from '@/pages/admin/PendingAuctionsPage'
import { AuctionReviewPage } from '@/pages/admin/AuctionReviewPage'

export function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-5rem)]">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auctions" element={<AuctionListPage />} />
          <Route path="/auctions/:id" element={<AuctionDetailPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/auctions/new" element={<CreateEditAuctionPage />} />
            <Route path="/auctions/:id/edit" element={<CreateEditAuctionPage />} />
            <Route path="/my-auctions" element={<MyAuctionsPage />} />
            <Route path="/my-wins" element={<MyWinsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/auctions" element={<PendingAuctionsPage />} />
            <Route path="/admin/auctions/:id" element={<AuctionReviewPage />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/auctions" replace />} />
          <Route path="*" element={<Navigate to="/auctions" replace />} />
        </Routes>
      </main>
    </>
  )
}
