import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { STAGE_CONFIGS } from '../src/lib/stages';
import type { Database } from '../src/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

const testClients = [
  { name: 'Tech Solutions Ltd', email: 'contact@techsolutions.ge', company: 'Tech Solutions' },
  { name: 'Digital Marketing Pro', email: 'info@digitalmarketing.ge', company: 'Digital Marketing' },
  { name: 'E-Commerce Store', email: 'admin@ecommerce.ge', company: 'E-Commerce' },
  { name: 'Restaurant Chain', email: 'info@restaurant.ge', company: 'Restaurant' },
  { name: 'Healthcare Provider', email: 'contact@healthcare.ge', company: 'Healthcare' },
  { name: 'Education Platform', email: 'info@education.ge', company: 'Education' },
  { name: 'Real Estate Agency', email: 'contact@realestate.ge', company: 'Real Estate' },
  { name: 'Travel Agency', email: 'info@travel.ge', company: 'Travel' },
];

const projectTemplates = [
  'Website Redesign',
  'Mobile App Development',
  'E-commerce Platform',
  'CRM System',
  'Marketing Dashboard',
  'Booking System',
  'Inventory Management',
  'Customer Portal',
  'Admin Panel',
  'Landing Page',
];

async function clearExistingData() {
  console.log('Clearing existing test data...');

  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log(' Cleared existing data');
}

async function seedData() {
  console.log('\n<1 Starting seed process...\n');

  // Get the first user to assign projects to
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (!users || users.length === 0) {
    console.error('L No users found! Please create a user first.');
    process.exit(1);
  }

  const userId = users[0].id;
  console.log(`Using user ID: ${userId}\n`);

  // Create test clients
  console.log('Creating test clients...');
  const { data: createdClients, error: clientError } = await supabase
    .from('clients')
    .insert(
      testClients.map(client => ({
        ...client,
        created_by: userId,
      }))
    )
    .select();

  if (clientError) {
    console.error('Error creating clients:', clientError);
    process.exit(1);
  }

  console.log(` Created ${createdClients.length} clients\n`);

  // Create projects distributed across all 18 stages
  console.log('Creating test projects across all stages...');

  const projects = [];
  let projectIndex = 0;

  // Create 2-4 projects per stage
  for (const stageConfig of STAGE_CONFIGS) {
    const projectsPerStage = Math.floor(Math.random() * 3) + 2; // 2-4 projects

    for (let i = 0; i < projectsPerStage; i++) {
      const client = createdClients[projectIndex % createdClients.length];
      const templateIndex = projectIndex % projectTemplates.length;

      projects.push({
        title: `${projectTemplates[templateIndex]} - ${client.company}`,
        description: `Test project for ${stageConfig.stage}`,
        client_id: client.id,
        current_stage: stageConfig.stage,
        stage_number: stageConfig.number,
        budget: Math.floor(Math.random() * 50000) + 5000,
        paid_amount: stageConfig.number > 15 ? Math.floor(Math.random() * 50000) + 5000 : 0,
        start_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completion_date: stageConfig.number === 18 ? new Date().toISOString().split('T')[0] : null,
        assigned_to: userId,
        created_by: userId,
      });

      projectIndex++;
    }
  }

  const { data: createdProjects, error: projectError } = await supabase
    .from('projects')
    .insert(projects)
    .select();

  if (projectError) {
    console.error('Error creating projects:', projectError);
    process.exit(1);
  }

  console.log(` Created ${createdProjects.length} projects\n`);

  // Print summary by stage
  console.log('=� Projects per stage:\n');
  const stageCounts: Record<number, number> = {};

  createdProjects.forEach(project => {
    stageCounts[project.stage_number] = (stageCounts[project.stage_number] || 0) + 1;
  });

  STAGE_CONFIGS.forEach(config => {
    const count = stageCounts[config.number] || 0;
    console.log(`  Stage ${config.number}: ${count} projects - ${config.stage}`);
  });

  console.log('\n Seed completed successfully!\n');
  console.log('You can now test:');
  console.log('  1. Dashboard pipeline showing correct counts');
  console.log('  2. Projects table with all projects');
  console.log('  3. Filters by stage');
  console.log('  4. Search by project name or client');
  console.log('  5. Pagination (if more than 20 projects)');
  console.log('  6. Real-time updates (try updating a project in another tab)\n');
}

async function main() {
  try {
    await clearExistingData();
    await seedData();
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
}

main();
