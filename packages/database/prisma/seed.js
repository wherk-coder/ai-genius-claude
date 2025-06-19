"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, admin, testPassword, testUser, teams, _i, teams_1, team, chiefs, bills, lakers, celtics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    return [4 /*yield*/, bcrypt.hash('admin123!', 10)];
                case 1:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@aibettingassistant.com' },
                            update: {},
                            create: {
                                email: 'admin@aibettingassistant.com',
                                password: adminPassword,
                                name: 'Admin User',
                                role: client_1.Role.ADMIN,
                                profile: {
                                    create: {
                                        preferredSports: [client_1.Sport.NFL, client_1.Sport.NBA, client_1.Sport.MLB],
                                        timeZone: 'America/New_York',
                                        notifications: true,
                                    },
                                },
                                subscription: {
                                    create: {
                                        tier: client_1.SubscriptionTier.PREMIUM,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        sportPackages: [client_1.Sport.NFL, client_1.Sport.NBA, client_1.Sport.MLB, client_1.Sport.NHL],
                                    },
                                },
                            },
                        })];
                case 2:
                    admin = _a.sent();
                    return [4 /*yield*/, bcrypt.hash('test123!', 10)];
                case 3:
                    testPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'test@example.com' },
                            update: {},
                            create: {
                                email: 'test@example.com',
                                password: testPassword,
                                name: 'Test User',
                                role: client_1.Role.USER,
                                profile: {
                                    create: {
                                        preferredSports: [client_1.Sport.NFL, client_1.Sport.NBA],
                                        bettingLimit: 500.0,
                                        timeZone: 'America/Los_Angeles',
                                        notifications: true,
                                    },
                                },
                                subscription: {
                                    create: {
                                        tier: client_1.SubscriptionTier.PLUS,
                                        status: client_1.SubscriptionStatus.ACTIVE,
                                        sportPackages: [client_1.Sport.NFL, client_1.Sport.NBA],
                                    },
                                },
                            },
                        })];
                case 4:
                    testUser = _a.sent();
                    teams = [
                        // NFL Teams
                        { name: 'Kansas City Chiefs', abbreviation: 'KC', sport: client_1.Sport.NFL, externalId: 'nfl-kc' },
                        { name: 'Buffalo Bills', abbreviation: 'BUF', sport: client_1.Sport.NFL, externalId: 'nfl-buf' },
                        { name: 'Miami Dolphins', abbreviation: 'MIA', sport: client_1.Sport.NFL, externalId: 'nfl-mia' },
                        // NBA Teams
                        { name: 'Los Angeles Lakers', abbreviation: 'LAL', sport: client_1.Sport.NBA, externalId: 'nba-lal' },
                        { name: 'Boston Celtics', abbreviation: 'BOS', sport: client_1.Sport.NBA, externalId: 'nba-bos' },
                        { name: 'Golden State Warriors', abbreviation: 'GSW', sport: client_1.Sport.NBA, externalId: 'nba-gsw' },
                    ];
                    _i = 0, teams_1 = teams;
                    _a.label = 5;
                case 5:
                    if (!(_i < teams_1.length)) return [3 /*break*/, 8];
                    team = teams_1[_i];
                    return [4 /*yield*/, prisma.team.upsert({
                            where: { externalId: team.externalId },
                            update: {},
                            create: team,
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [4 /*yield*/, prisma.team.findFirst({ where: { abbreviation: 'KC' } })];
                case 9:
                    chiefs = _a.sent();
                    return [4 /*yield*/, prisma.team.findFirst({ where: { abbreviation: 'BUF' } })];
                case 10:
                    bills = _a.sent();
                    return [4 /*yield*/, prisma.team.findFirst({ where: { abbreviation: 'LAL' } })];
                case 11:
                    lakers = _a.sent();
                    return [4 /*yield*/, prisma.team.findFirst({ where: { abbreviation: 'BOS' } })];
                case 12:
                    celtics = _a.sent();
                    if (!(chiefs && bills)) return [3 /*break*/, 14];
                    return [4 /*yield*/, prisma.game.upsert({
                            where: { externalId: 'nfl-week1-kc-buf' },
                            update: {},
                            create: {
                                externalId: 'nfl-week1-kc-buf',
                                sport: client_1.Sport.NFL,
                                homeTeam: chiefs.name,
                                awayTeam: bills.name,
                                league: 'NFL',
                                gameTime: new Date('2024-01-15T18:00:00Z'),
                                status: 'scheduled',
                                homeScore: null,
                                awayScore: null,
                            },
                        })];
                case 13:
                    _a.sent();
                    _a.label = 14;
                case 14:
                    if (!(lakers && celtics)) return [3 /*break*/, 16];
                    return [4 /*yield*/, prisma.game.upsert({
                            where: { externalId: 'nba-regular-lal-bos' },
                            update: {},
                            create: {
                                externalId: 'nba-regular-lal-bos',
                                sport: client_1.Sport.NBA,
                                homeTeam: lakers.name,
                                awayTeam: celtics.name,
                                league: 'NBA',
                                gameTime: new Date('2024-01-20T21:00:00Z'),
                                status: 'scheduled',
                                homeScore: null,
                                awayScore: null,
                            },
                        })];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16: 
                // Create sample insights
                return [4 /*yield*/, prisma.insight.create({
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
                    })];
                case 17:
                    // Create sample insights
                    _a.sent();
                    return [4 /*yield*/, prisma.insight.create({
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
                        })];
                case 18:
                    _a.sent();
                    console.log('✅ Database seeded successfully!');
                    console.log("Created admin user: admin@aibettingassistant.com (password: admin123!)");
                    console.log("Created test user: test@example.com (password: test123!)");
                    console.log("Created ".concat(teams.length, " teams, 2 games, and sample insights"));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
