import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dogwalking.com' },
    update: {},
    create: {
      email: 'admin@dogwalking.com',
      password: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+49 123 456789'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample owner (via invitation flow in real app)
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      password: ownerPassword,
      role: 'OWNER',
      firstName: 'Maria',
      lastName: 'Schmidt',
      phone: '+49 987 654321'
    }
  });

  console.log('✅ Owner user created:', owner.email);

  // Create sample dogs
  const dog1 = await prisma.dog.upsert({
    where: { id: 'demo-dog-1' },
    update: {},
    create: {
      id: 'demo-dog-1',
      name: 'Max',
      breed: 'Golden Retriever',
      age: 3,
      weight: 30,
      ownerId: owner.id,
      medicalNotes: 'Keine bekannten Allergien',
      emergencyContact: '+49 987 654321',
      photoUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400'
    }
  });

  const dog2 = await prisma.dog.upsert({
    where: { id: 'demo-dog-2' },
    update: {},
    create: {
      id: 'demo-dog-2',
      name: 'Bella',
      breed: 'Labrador',
      age: 2,
      weight: 25,
      ownerId: owner.id,
      medicalNotes: 'Sehr energetisch',
      emergencyContact: '+49 987 654321',
      photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
    }
  });

  console.log('✅ Sample dogs created:', dog1.name, dog2.name);

  // Create rates
  const rate1 = await prisma.rate.create({
    data: {
      dogId: dog1.id,
      hourlyRate: 25.0,
      effectiveFrom: new Date('2024-01-01')
    }
  });

  const rate2 = await prisma.rate.create({
    data: {
      dogId: dog2.id,
      hourlyRate: 22.5,
      effectiveFrom: new Date('2024-01-01')
    }
  });

  console.log('✅ Rates created');

  // Create sample walks
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const walk1 = await prisma.walk.create({
    data: {
      date: yesterday.toISOString().split('T')[0],
      startTime: new Date(yesterday.setHours(10, 0, 0)),
      endTime: new Date(yesterday.setHours(11, 30, 0)),
      status: 'COMPLETED',
      adminId: admin.id,
      notes: 'Schöner Walk im Park',
      attendances: {
        create: [
          {
            dogId: dog1.id,
            attended: true,
            duration: 90
          },
          {
            dogId: dog2.id,
            attended: true,
            duration: 90
          }
        ]
      }
    }
  });

  const walk2 = await prisma.walk.create({
    data: {
      date: today.toISOString().split('T')[0],
      status: 'SCHEDULED',
      adminId: admin.id,
      notes: 'Geplanter Walk heute Nachmittag',
      attendances: {
        create: [
          {
            dogId: dog1.id,
            attended: false
          }
        ]
      }
    }
  });

  const walk3 = await prisma.walk.create({
    data: {
      date: tomorrow.toISOString().split('T')[0],
      status: 'SCHEDULED',
      adminId: admin.id,
      attendances: {
        create: [
          {
            dogId: dog1.id,
            attended: false
          },
          {
            dogId: dog2.id,
            attended: false
          }
        ]
      }
    }
  });

  console.log('✅ Sample walks created');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Test credentials:');
  console.log('   Admin: admin@dogwalking.com / admin123');
  console.log('   Owner: owner@example.com / owner123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

