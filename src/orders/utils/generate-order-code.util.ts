import { PrismaService } from '../../prisma/prisma.service';

/**
 * Generate a unique order code with format: SOL-YYYYMMDD-XXXX
 * - SOL: Prefix for Soligant
 * - YYYYMMDD: Current date
 * - XXXX: Sequential number (0001, 0002, ...)
 *
 * @param prisma PrismaService instance
 * @returns Promise<string> - Generated order code
 */
export async function generateOrderCode(
  prisma: PrismaService,
): Promise<string> {
  const now = new Date();

  // Format date as YYYYMMDD
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Prefix
  const prefix = `SOL-${dateStr}`;

  // Get all orders with today's prefix
  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59);

  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      information: true,
    },
  });

  // Extract order codes and find the highest sequence number
  let maxSequence = 0;

  for (const order of todayOrders) {
    if (order.information && typeof order.information === 'object') {
      const info = order.information as any;
      const orderCode = info.orderCode;

      if (orderCode && orderCode.startsWith(prefix)) {
        // Extract sequence number (last 4 digits)
        const sequencePart = orderCode.split('-').pop();
        const sequence = parseInt(sequencePart, 10);

        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    }
  }

  // Increment sequence
  const newSequence = maxSequence + 1;
  const sequenceStr = String(newSequence).padStart(4, '0');

  return `${prefix}-${sequenceStr}`;
}
