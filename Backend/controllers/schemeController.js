import Scheme from '../models/scheme.js';

// Rule Engine function
function checkEligibility(user, scheme) {
    const rules = scheme.rules || {};
    const beneficiaryCategories = scheme.beneficiary_categories || {};

    // Age validation - handle both standard and general/special variants
    if (rules.min_age !== undefined && user.age < rules.min_age) return false;
    
    // For schemes with max_age_general and max_age_special
    if (user.beneficiary_category) {
        if (rules.max_age_special !== undefined && user.age > rules.max_age_special) return false;
    } else {
        if (rules.max_age_special !== undefined && !user.beneficiary_category) {
            // If general max age exists and user is general, use that
            if (rules.max_age_general !== undefined && user.age > rules.max_age_general) return false;
        }
    }
    
    // Fallback to standard max_age if available
    if (rules.max_age && user.age > rules.max_age) return false;

    // Gender validation (optional)
    if (rules.gender && Array.isArray(rules.gender)) {
        if (!rules.gender.includes(user.gender)) return false;
    }

    // State/Location validation (optional - only check if specified and user has a location)
    if (rules.state && user.location && user.location !== rules.state) return false;
    if (rules.domicile && user.location && user.location !== rules.domicile) return false;

    // Investment/Project cost validation (optional)
    if (rules.max_investment && user.investment && user.investment > rules.max_investment) return false;
    if (rules.max_project_cost && user.investment && user.investment > rules.max_project_cost) return false;
    if (rules.min_project_cost && user.investment && user.investment < rules.min_project_cost) return false;

    // Income validation (optional)
    if (rules.max_income && user.income && user.income > rules.max_income) return false;
    if (rules.max_family_income && user.income && user.income > rules.max_family_income) return false;

    // Experience validation (optional)
    if (rules.min_experience && user.experience !== undefined && user.experience < rules.min_experience) return false;
    if (rules.min_experience_years && user.experience !== undefined && user.experience < rules.min_experience_years) return false;

    // Education validation (optional - just a note, not enforced strictly)
    // if (rules.min_education && user.education) { ... }

    // Previous subsidy validation (optional)
    if (rules.max_previous_subsidy && user.previous_subsidy && user.previous_subsidy > rules.max_previous_subsidy) return false;
    if (rules.prior_subsidy_limit && user.previous_subsidy && user.previous_subsidy > rules.prior_subsidy_limit) return false;

    // Beneficiary categories validation (optional - only if user specified a category)
    if (user.beneficiary_category && Object.keys(beneficiaryCategories).length > 0) {
        // Check if user's category exists as a key in beneficiary_categories object
        if (!Object.keys(beneficiaryCategories).includes(user.beneficiary_category)) {
            return false;
        }
    }

    return true;
}

// Controller for recommending schemes
const recommendSchemes = async (req, res) => {
    try {
        const user = req.body;

        const schemes = await Scheme.findAll();

        const eligible = schemes.filter(scheme => checkEligibility(user, scheme));

        res.json({
            success: true,
            count: eligible.length,
            data: eligible
        });
    } catch (error) {
        console.error('Error recommending schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all schemes
const getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.findAll();
        res.json({
            success: true,
            data: schemes
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export { recommendSchemes, getAllSchemes };