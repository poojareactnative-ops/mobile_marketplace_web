"use client"

import Link from 'next/link'
import DashboardLayout from '../../components/DashboardLayout'
import { ShoppingBag, Wrench } from 'lucide-react'
import MobileRepairingOrders from './mobile-repairing'

export default function OrdersIndex() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
       
        <MobileRepairingOrders/>
      </div>
    </DashboardLayout>
  )
}