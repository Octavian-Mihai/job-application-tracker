import { fileURLToPath } from 'node:url';
import { db } from './connection.js';
import { migrate } from './migrate.js';
import * as Applications from '../models/application.js';

/** @type {Partial<import('../models/application.js').ApplicationInput>[]} */
export const SAMPLE_APPLICATIONS = [
  { company: 'Shopify', role_title: 'Backend Developer Intern', location: 'Remote (Canada)', job_url: 'https://www.shopify.com/careers', status: 'interview', date_applied: '2026-09-02', resume_version: 'v2 backend', notes: 'Technical screen with two engineers; focus on Ruby and system design basics.', follow_up_date: '2026-10-06' },
  { company: 'Stripe', role_title: 'Software Engineer Intern', location: 'Dublin, IE', job_url: 'https://stripe.com/jobs', status: 'online_assessment', date_applied: '2026-09-05', resume_version: 'v2 backend', notes: 'HackerRank link received, 90 min. Due Oct 8.', follow_up_date: '2026-10-08' },
  { company: 'Datadog', role_title: 'Software Engineer Intern, Platform', location: 'Paris, FR', job_url: 'https://careers.datadoghq.com', status: 'applied', date_applied: '2026-09-18', resume_version: 'v3 platform', notes: 'Applied via referral from a classmate.' },
  { company: 'Atlassian', role_title: 'Frontend Engineer Intern', location: 'Sydney, AU (hybrid)', job_url: 'https://www.atlassian.com/company/careers', status: 'rejected', date_applied: '2026-08-20', resume_version: 'v1 general', notes: 'Rejected after resume screen. Ask for feedback next cycle.' },
  { company: 'Spotify', role_title: 'Backend Engineer Intern', location: 'Stockholm, SE', job_url: 'https://www.lifeatspotify.com', status: 'applied', date_applied: '2026-09-25', resume_version: 'v2 backend', follow_up_date: '2026-10-09' },
  { company: 'Cloudflare', role_title: 'Systems Engineer Intern', location: 'London, UK', job_url: 'https://www.cloudflare.com/careers', status: 'offer', date_applied: '2026-08-12', resume_version: 'v3 platform', notes: 'Offer received. Deadline to respond Oct 15. Compare with Shopify.', follow_up_date: '2026-10-12' },
  { company: 'JetBrains', role_title: 'Developer Tools Intern', location: 'Remote (EU)', job_url: 'https://www.jetbrains.com/careers', status: 'applied', date_applied: '2026-09-29', resume_version: 'v1 general' },
  { company: 'Local Startup Co', role_title: 'Full-Stack Intern', location: 'Bucharest, RO', status: 'rejected', date_applied: '2026-08-28', resume_version: 'v1 general', notes: 'Position filled internally.' },
];

export function seed({ force = false } = {}) {
  migrate();
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM applications').get();
  if (n > 0 && !force) {
    throw new Error(`applications table already has ${n} rows. Re-run with --force to add the samples anyway.`);
  }
  db.transaction(() => SAMPLE_APPLICATIONS.forEach((a) => Applications.create(a)))();
  return SAMPLE_APPLICATIONS.length;
}

// Run directly: `npm run seed` or `npm run seed -- --force`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    console.log(`Seeded ${seed({ force: process.argv.includes('--force') })} applications.`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
