import { PrismaClient, Role, SubscriptionTier, SubscriptionStatus, Sport } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aibettingassistant.com' },
    update: {},
    create: {
      email: 'admin@aibettingassistant.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      profile: {
        create: {
          preferredSports: [Sport.NFL, Sport.NBA, Sport.MLB],
          timeZone: 'America/New_York',
          notifications: true,
        },
      },
      subscription: {
        create: {
          tier: SubscriptionTier.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
          sportPackages: [Sport.NFL, Sport.NBA, Sport.MLB, Sport.NHL],
        },
      },
    },
  });

  // Create test user
  const testPassword = await bcrypt.hash('test123!', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testPassword,
      name: 'Test User',
      role: Role.USER,
      profile: {
        create: {
          preferredSports: [Sport.NFL, Sport.NBA],
          bettingLimit: 500.0,
          timeZone: 'America/Los_Angeles',
          notifications: true,
        },
      },
      subscription: {
        create: {
          tier: SubscriptionTier.PLUS,
          status: SubscriptionStatus.ACTIVE,
          sportPackages: [Sport.NFL, Sport.NBA],
        },
      },
    },
  });

  // Create sample teams
  const teams = [
    // NFL Teams
    { name: 'Kansas City Chiefs', abbreviation: 'KC', sport: Sport.NFL, externalId: 'nfl-kc' },
    { name: 'Buffalo Bills', abbreviation: 'BUF', sport: Sport.NFL, externalId: 'nfl-buf' },
    { name: 'Miami Dolphins', abbreviation: 'MIA', sport: Sport.NFL, externalId: 'nfl-mia' },
    
    // NBA Teams
    { name: 'Los Angeles Lakers', abbreviation: 'LAL', sport: Sport.NBA, externalId: 'nba-lal' },
    { name: 'Boston Celtics', abbreviation: 'BOS', sport: Sport.NBA, externalId: 'nba-bos' },
    { name: 'Golden State Warriors', abbreviation: 'GSW', sport: Sport.NBA, externalId: 'nba-gsw' },
  ];

  for (const team of teams) {
    await prisma.team.upsert({
      where: { externalId: team.externalId },
      update: {},
      create: team,
    });
  }

  // Create sample games
  const chiefs = await prisma.team.findFirst({ where: { abbreviation: 'KC' } });
  const bills = await prisma.team.findFirst({ where: { abbreviation: 'BUF' } });
  const lakers = await prisma.team.findFirst({ where: { abbreviation: 'LAL' } });
  const celtics = await prisma.team.findFirst({ where: { abbreviation: 'BOS' } });

  if (chiefs && bills) {
    await prisma.game.upsert({
      where: { externalId: 'nfl-week1-kc-buf' },
      update: {},
      create: {
        externalId: 'nfl-week1-kc-buf',
        sport: Sport.NFL,
        homeTeamId: chiefs.id,
        awayTeamId: bills.id,
        startTime: new Date('2024-01-15T18:00:00Z'),
        status: 'scheduled',
        odds: {
          spread: { home: -3.5, away: 3.5 },
          moneyline: { home: -180, away: 155 },
          total: { over: 47.5, under: 47.5 }
        },
        props: {
          player_props: [
            { player: 'Josh Allen', type: 'passing_yards', line: 267.5 },
            { player: 'Patrick Mahomes', type: 'passing_yards', line: 289.5 }
          ]
        }
      },
    });
  }

  if (lakers && celtics) {
    await prisma.game.upsert({
      where: { externalId: 'nba-regular-lal-bos' },
      update: {},
      create: {
        externalId: 'nba-regular-lal-bos',
        sport: Sport.NBA,
        homeTeamId: lakers.id,
        awayTeamId: celtics.id,
        startTime: new Date('2024-01-20T21:00:00Z'),
        status: 'scheduled',
        odds: {
          spread: { home: -2.5, away: 2.5 },
          moneyline: { home: -125, away: 105 },
          total: { over: 225.5, under: 225.5 }
        },
        props: {
          player_props: [
            { player: 'LeBron James', type: 'points', line: 25.5 },
            { player: 'Jayson Tatum', type: 'points', line: 27.5 }
          ]
        }
      },
    });
  }

  // Create sample insights
  await prisma.insight.create({
    data: {
      userId: testUser.id,
      type: 'bet_recommendation',
      title: 'Strong Value on Chiefs -3.5',
      content: 'Historical data shows Kansas City performs exceptionally well as home favorites in January games. The line movement from -4 to -3.5 indicates sharp money on KC.',
      confidence: 0.78,
      metadata: {
        factors: ['home_field_advantage', 'january_performance', 'line_movement'],
        historical_record: '8-2 ATS in similar situations'
      }
    },
  });

  await prisma.insight.create({
    data: {
      userId: testUser.id,
      type: 'bankroll_management',
      title: 'Recommended Bet Size: 2-3% of Bankroll',
      content: 'Based on your betting history and current bankroll, consider limiting this wager to $10-15 to maintain proper risk management.',
      confidence: 0.95,
      metadata: {
        suggested_amount: 12.50,
        risk_level: 'moderate',
        reasoning: 'conservative_kelly_criterion'
      }
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created admin user: admin@aibettingassistant.com (password: admin123!)`);
  console.log(`Created test user: test@example.com (password: test123!)`);
  console.log(`Created ${teams.length} teams, 2 games, and sample insights`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });