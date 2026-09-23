import prisma from '../db'

export async function getRepairJobs(shopId: string, statusFilter?: string) {
  const where: any = { shopId }
  if (statusFilter && statusFilter !== 'ALL') {
    where.status = statusFilter
  }

  return prisma.repairJob.findMany({
    where,
    include: {
      customer: true,
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      assignedToUser: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRepairJobById(shopId: string, jobId: string) {
  const where: any = { id: jobId }
  if (shopId && shopId !== 'ALL') {
    where.shopId = shopId
  }

  return prisma.repairJob.findFirst({
    where,
    include: {
      customer: true,
      updates: {
        orderBy: { createdAt: 'desc' },
        include: {
          authorUser: { select: { id: true, name: true, role: true } },
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
      assignedToUser: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function createRepairJob(
  shopId: string,
  data: {
    customerName: string
    customerPhone: string
    brand?: string | null
    model?: string | null
    problemDescription: string
    estimatedCostPaise?: number | null
  },
  authorUserId?: string
) {
  // Upsert customer for shop
  let customer = await prisma.repairCustomer.findFirst({
    where: { shopId, phone: data.customerPhone },
  })

  if (!customer) {
    customer = await prisma.repairCustomer.create({
      data: {
        shopId,
        name: data.customerName,
        phone: data.customerPhone,
      },
    })
  }

  const job = await prisma.repairJob.create({
    data: {
      shopId,
      customerId: customer.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      brand: data.brand || null,
      model: data.model || null,
      problemDescription: data.problemDescription,
      status: 'SUBMITTED',
      estimatedCostPaise: data.estimatedCostPaise || null,
    },
  })

  // Create initial audit log
  await prisma.repairUpdate.create({
    data: {
      repairJobId: job.id,
      authorUserId: authorUserId || null,
      status: 'SUBMITTED',
      note: 'Problem submitted and ticket opened.',
      estimatedCostPaise: data.estimatedCostPaise || null,
    },
  })

  return job
}

export async function updateRepairJob(
  shopId: string,
  jobId: string,
  data: {
    status?: string
    estimatedCostPaise?: number | null
    isSellable?: boolean
    assignedToUserId?: string | null
    note?: string
  },
  authorUserId?: string
) {
  const where: any = { id: jobId }
  if (shopId && shopId !== 'ALL') {
    where.shopId = shopId
  }

  const existing = await prisma.repairJob.findFirst({
    where,
  })

  if (!existing) {
    throw new Error('REPAIR_JOB_NOT_FOUND_OR_UNAUTHORIZED')
  }

  const newStatus = data.status || existing.status

  const updatedJob = await prisma.repairJob.update({
    where: { id: jobId },
    data: {
      status: newStatus,
      estimatedCostPaise:
        data.estimatedCostPaise !== undefined ? data.estimatedCostPaise : existing.estimatedCostPaise,
      isSellable: data.isSellable !== undefined ? data.isSellable : existing.isSellable,
      assignedToUserId:
        data.assignedToUserId !== undefined ? data.assignedToUserId : existing.assignedToUserId,
    },
  })

  // Write audit trail record for state change or note
  await prisma.repairUpdate.create({
    data: {
      repairJobId: jobId,
      authorUserId: authorUserId || null,
      status: newStatus,
      note: data.note || `Status updated to ${newStatus}`,
      estimatedCostPaise: data.estimatedCostPaise ?? existing.estimatedCostPaise,
    },
  })

  return updatedJob
}

export async function createRepairUpdate(
  shopId: string,
  jobId: string,
  data: {
    status: string
    note?: string
    estimatedCostPaise?: number | null
  },
  authorUserId?: string
) {
  const existing = await prisma.repairJob.findFirst({
    where: { id: jobId, shopId },
  })
  if (!existing) throw new Error('REPAIR_JOB_NOT_FOUND_OR_UNAUTHORIZED')

  // Update parent job status as well
  await prisma.repairJob.update({
    where: { id: jobId },
    data: {
      status: data.status,
      estimatedCostPaise:
        data.estimatedCostPaise !== undefined ? data.estimatedCostPaise : existing.estimatedCostPaise,
    },
  })

  return prisma.repairUpdate.create({
    data: {
      repairJobId: jobId,
      authorUserId: authorUserId || null,
      status: data.status,
      note: data.note || null,
      estimatedCostPaise: data.estimatedCostPaise ?? existing.estimatedCostPaise,
    },
  })
}

export async function recordRepairPayment(
  shopId: string,
  jobId: string,
  data: {
    amountPaise: number
    method?: string
  }
) {
  const existing = await prisma.repairJob.findFirst({
    where: { id: jobId, shopId },
  })
  if (!existing) throw new Error('REPAIR_JOB_NOT_FOUND_OR_UNAUTHORIZED')

  return prisma.repairPayment.create({
    data: {
      repairJobId: jobId,
      amountPaise: data.amountPaise,
      method: data.method || 'CASH',
      status: 'COMPLETED',
    },
  })
}

export async function getRepairCustomers(shopId: string) {
  return prisma.repairCustomer.findMany({
    where: { shopId },
    include: {
      _count: { select: { repairJobs: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createRepairCustomer(
  shopId: string,
  data: {
    name: string
    phone: string
    email?: string | null
    address?: string | null
  }
) {
  const existing = await prisma.repairCustomer.findFirst({
    where: { shopId, phone: data.phone },
  })

  if (existing) {
    return prisma.repairCustomer.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email ?? existing.email,
        address: data.address ?? existing.address,
      },
    })
  }

  return prisma.repairCustomer.create({
    data: {
      shopId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
    },
  })
}
