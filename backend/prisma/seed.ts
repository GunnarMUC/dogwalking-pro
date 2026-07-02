import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await argon2.hash('admin123');
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
  console.log('Admin user created:', admin.email);

  const ownerPassword = await argon2.hash('owner123');
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
  console.log('Owner user created:', owner.email);

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
  console.log('Sample dogs created:', dog1.name, dog2.name);

  await prisma.rate.createMany({
    data: [
      { dogId: dog1.id, hourlyRate: 25.0, effectiveFrom: new Date('2024-01-01') },
      { dogId: dog2.id, hourlyRate: 22.5, effectiveFrom: new Date('2024-01-01') },
    ],
    skipDuplicates: true,
  });
  console.log('Rates created');

  await prisma.walkerProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      bio: 'Erfahrener Hundeführer mit über 5 Jahren Erfahrung im Gassigehen. Liebevoller Umgang mit allen Hunderassen.',
      experienceYears: 5,
      hourlyRate: 25.0,
      serviceAreas: JSON.stringify(['München Zentrum', 'Schwabing', 'Maxvorstadt']),
      availability: JSON.stringify(['Mo-Fr 08:00-18:00', 'Sa 10:00-14:00']),
      isAvailable: true,
      certifications: JSON.stringify(['Hundeführerschein', 'Erste Hilfe für Hunde']),
      averageRating: 4.8,
      totalWalks: 342,
    }
  });
  console.log('Walker profile created for admin');

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.walk.create({
    data: {
      date: yesterday.toISOString().split('T')[0],
      startTime: new Date(yesterday.setHours(10, 0, 0)),
      endTime: new Date(yesterday.setHours(11, 30, 0)),
      status: 'COMPLETED',
      adminId: admin.id,
      notes: 'Schöner Walk im Park',
      attendances: {
        create: [
          { dogId: dog1.id, attended: true, duration: 90 },
          { dogId: dog2.id, attended: true, duration: 90 }
        ]
      }
    }
  });

  await prisma.walk.create({
    data: {
      date: today.toISOString().split('T')[0],
      status: 'SCHEDULED',
      adminId: admin.id,
      notes: 'Geplanter Walk heute Nachmittag',
      attendances: {
        create: [{ dogId: dog1.id, attended: false }]
      }
    }
  });

  await prisma.walk.create({
    data: {
      date: tomorrow.toISOString().split('T')[0],
      status: 'SCHEDULED',
      adminId: admin.id,
      attendances: {
        create: [
          { dogId: dog1.id, attended: false },
          { dogId: dog2.id, attended: false }
        ]
      }
    }
  });
  console.log('Sample walks created');

  await prisma.recurringWalkPlan.create({
    data: {
      dogId: dog1.id,
      ownerId: owner.id,
      dayOfWeek: 1,
      time: '10:00',
      duration: 60,
      active: true,
    }
  });
  await prisma.recurringWalkPlan.create({
    data: {
      dogId: dog2.id,
      ownerId: owner.id,
      dayOfWeek: 3,
      time: '15:00',
      duration: 45,
      active: true,
    }
  });
  console.log('Recurring walk plans created');

  console.log('\nSeeding completed!');
  console.log('\nTest credentials:');
  console.log('   Admin: admin@dogwalking.com / admin123');
  console.log('   Owner: owner@example.com / owner123');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
