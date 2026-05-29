import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';


const { Pool } = pkg;
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);


// Load environment variables


dotenv.config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});


async function runMigration() {
    const client = await pool.connect();


    try{
        console.log('Running Database Migration...');


        //Read the schema file
        const schemaPath = path.join(_dirname, 'config', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');


        //Execute the schema


        await client.query(schemaSql);

        // Add phone column if it doesn't exist
        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        `);
        console.log('Phone column added to users table');

        // Create user_saved_schemes table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_saved_schemes (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                scheme_id INT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
                saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, scheme_id)
            );
        `);
        console.log('user_saved_schemes table created');


        // Insert sample schemes
        await client.query(`
            INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories)
            VALUES (
                'TWEES',
                'Tamil Nadu Women Entrepreneurs Empowerment Scheme',
                'any',
                1000000,
                'tamil_nadu',
                '{
                    "min_age": 18,
                    "max_age": 55,
                    "gender": ["female", "transgender"],
                    "min_education": "no_minimum",
                    "domicile": "tamil_nadu",
                    "ration_card_required": true,
                    "income_ceiling": "no_limit",
                    "max_project_cost": 1000000,
                    "promoter_contribution_percent": 5,
                    "one_member_per_family": true,
                    "kkt_expansion_topup": "eligible"
                }',
                '{
                    "subsidy_percent": 25,
                    "max_subsidy": 200000,
                    "interest_subvention": "not_applicable",
                    "loan_assistance": "available"
                }',
                '{
                    "women": "Women Entrepreneurs",
                    "transgender": "Transgender Persons",
                    "sc_st": "SC/ST",
                    "pwd": "Persons with Disabilities",
                    "widow": "Widows/Destitute Widows",
                    "bpl_women": "Women from BPL Families"
                }'
            ) ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, business_category=EXCLUDED.business_category, max_investment=EXCLUDED.max_investment, location=EXCLUDED.location, rules=EXCLUDED.rules, benefits=EXCLUDED.benefits, beneficiary_categories=EXCLUDED.beneficiary_categories;
        `);

        await client.query(`
            INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits)
            VALUES (
                'KKT',
                'Kalaignar Kaivinai Thittam',
                'any',
                500000,
                'tamil_nadu',
                '{
                    "min_age": 35,
                    "min_experience_years": 5,
                    "min_experience_description": "in one of 25 listed trades",
                    "gender": ["male", "female", "transgender"],
                    "prior_subsidy_limit": 150000,
                    "prior_subsidy_repayment": "required if exceeded 1.5 lakhs in last 5 years",
                    "state": "tamil_nadu",
                    "required_documents": ["Aadhaar", "Welfare Board Registration if applicable", "Detailed Project Report"]
                }',
                '{
                    "subsidy_percent": 25,
                    "max_subsidy": 50000,
                    "loan_assistance": "available",
                    "eligible_trades": "25 listed trades"
                }'
            ) ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, business_category=EXCLUDED.business_category, max_investment=EXCLUDED.max_investment, location=EXCLUDED.location, rules=EXCLUDED.rules, benefits=EXCLUDED.benefits;
        `);

        await client.query(`
            INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories)
            VALUES (
                'UYEGP',
                'Unemployed Youth Employment Generation Programme',
                'trading',
                1500000,
                'national',
                '{
                    "min_age": 18,
                    "max_age_general": 45,
                    "max_age_special": 55,
                    "min_education": "8th_pass",
                    "max_family_income": 500000,
                    "residency": "3_years",
                    "promoter_contribution_general": "10%",
                    "promoter_contribution_special": "5%"
                }',
                '{
                    "subsidy_percent": 25,
                    "max_subsidy": 375000,
                    "loan_assistance": "available"
                }',
                '{
                    "women": "Women",
                    "minorities": "Minorities",
                    "bc_mbc": "BC/MBC",
                    "sc_st": "SC/ST",
                    "ex_servicemen": "Ex-servicemen",
                    "transgenders": "Transgenders",
                    "pwd": "Differently Abled"
                }'
            ) ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, business_category=EXCLUDED.business_category, max_investment=EXCLUDED.max_investment, location=EXCLUDED.location, rules=EXCLUDED.rules, benefits=EXCLUDED.benefits, beneficiary_categories=EXCLUDED.beneficiary_categories;
        `);

        await client.query(`
            INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories)
            VALUES (
                'NEEDS',
                'New Entrepreneur-cum-Enterprise Development Scheme',
                'manufacturing',
                50000000,
                'tamil_nadu',
                '{
                    "min_age": 21,
                    "max_age_general": 45,
                    "max_age_special": 55,
                    "min_education": "higher_secondary",
                    "min_project_cost": 1000000,
                    "max_project_cost": 50000000,
                    "promoter_contribution_general": "10%",
                    "promoter_contribution_special": "5%",
                    "target": "first_generation_entrepreneurs"
                }',
                '{
                    "subsidy_percent": 25,
                    "max_subsidy": 7500000,
                    "interest_subvention": "3%",
                    "loan_assistance": "available"
                }',
                '{
                    "women": "Women",
                    "bc_mbc": "BC/MBC",
                    "sc_st": "SC/ST",
                    "ex_servicemen": "Ex-servicemen",
                    "transgenders": "Transgenders",
                    "pwd": "Differently Abled"
                }'
            ) ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, business_category=EXCLUDED.business_category, max_investment=EXCLUDED.max_investment, location=EXCLUDED.location, rules=EXCLUDED.rules, benefits=EXCLUDED.benefits, beneficiary_categories=EXCLUDED.beneficiary_categories;
        `);

        await client.query(`
            INSERT INTO schemes (name, description, business_category, max_investment, location, rules, benefits, beneficiary_categories)
            VALUES (
                'AABCS',
                'Annal Ambedkar Business Champions Scheme',
                'manufacturing',
                150000000,
                'tamil_nadu',
                '{
                    "max_age": 55,
                    "min_education": "no_minimum",
                    "beneficiary": "SC/ST_owned_100_percent",
                    "project_type": ["new_enterprise", "expansion"],
                    "eligible_costs": ["land", "plant", "machinery", "equipment", "computing_devices", "vehicles"],
                    "land_max_percent": "20%",
                    "online_portal": "msmeonline.tn.gov.in/aabcs"
                }',
                '{
                    "capital_subsidy_percent": 35,
                    "max_capital_subsidy": 15000000,
                    "interest_subvention_machinery": "6%",
                    "machinery_loan_max_years": 10,
                    "working_capital_subvention_years": 2,
                    "credit_linkage_required": false
                }',
                '{
                    "sc_st": "SC/ST Communities"
                }'
            ) ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description, business_category=EXCLUDED.business_category, max_investment=EXCLUDED.max_investment, location=EXCLUDED.location, rules=EXCLUDED.rules, benefits=EXCLUDED.benefits, beneficiary_categories=EXCLUDED.beneficiary_categories;
        `);
        
    
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        


        console.log('Database migration completed succesfull');
        console.log('Table created');
        console.log('Table created-users');
        console.log('Table created-schemes');
        console.log('Sample schemes inserted');


    }catch (error){
        console.log('Migration failed:', error.message);
        process.exit(1);
    }finally {
        client.release();
        await pool.end();
    }
}


runMigration();