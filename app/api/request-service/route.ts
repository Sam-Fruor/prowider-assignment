import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

const RULES = {
  1: { mandatory: [1], pool: [2, 3, 4] },
  2: { mandatory: [5], pool: [6, 7, 8] },
  3: { mandatory: [1, 4], pool: [2, 3, 5, 6, 7, 8] }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, city, description } = body;
    const serviceId = Number(body.serviceId); 

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      const lead = await tx.lead.create({
        data: { name, phone, city, serviceId, description }
      });

      await tx.allocationState.upsert({
        where: { serviceId },
        update: {}, 
        create: { serviceId, lastProviderId: 0 } 
      });
      await tx.$executeRaw`SELECT * FROM "AllocationState" WHERE "serviceId" = ${serviceId} FOR UPDATE`;

      const rule = RULES[serviceId as keyof typeof RULES];
      let assignedCount = 0;
      const providersToAssign = [];

      for (const pId of rule.mandatory) {
        if (assignedCount >= 3) break;
        

        const updated = await tx.provider.updateMany({
          where: { id: pId, quota: { gt: 0 } },
          data: { quota: { decrement: 1 } }
        });


        if (updated.count > 0) {
          providersToAssign.push(pId);
          assignedCount++;
        }
      }

      if (assignedCount < 3) {
        let currentState = await tx.allocationState.findUnique({ where: { serviceId } });
        let lastId = currentState?.lastProviderId || 0;

        const pool = rule.pool;
        let startIndex = pool.indexOf(lastId);
        
        for (let i = 1; i <= pool.length; i++) {
          if (assignedCount >= 3) break;
          
          const nextIndex = (startIndex + i) % pool.length;
          const candidateId = pool[nextIndex];

          if (providersToAssign.includes(candidateId)) continue;

          const updated = await tx.provider.updateMany({
            where: { id: candidateId, quota: { gt: 0 } },
            data: { quota: { decrement: 1 } }
          });

          if (updated.count > 0) {
            providersToAssign.push(candidateId);
            assignedCount++;
            
            await tx.allocationState.update({
              where: { serviceId },
              data: { lastProviderId: candidateId }
            });
          }
        }
      }

      // 5. Execute Assignments
      // We already atomically secured the quotas above, so we just create the links!
      for (const pId of providersToAssign) {
        await tx.assignment.create({
          data: { leadId: lead.id, providerId: pId }
        });
      }

      return lead;
    }, { maxWait: 5000, timeout: 20000 });

    return NextResponse.json({ success: true, lead: result });

  } catch (error: any) {
    console.error("BACKEND ERROR:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate lead: You have already requested this service.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}