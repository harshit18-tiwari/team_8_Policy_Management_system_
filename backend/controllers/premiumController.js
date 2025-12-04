const ProductModel = require('../models/ProductModel');

exports.calculatePremium = (req, res) => {
    const { productId, age, coverageAmount, vehicleDetails, healthDetails, lifeDetails } = req.body;

    const product = ProductModel.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let premium = product.base_price;
    const breakdown = {
        'Base Premium': product.base_price
    };

    // VEHICLE INSURANCE CALCULATION
    if (product.type === 'VEHICLE') {
        const { vehicleType, vehicleAge, idv, city } = vehicleDetails || {};

        // Vehicle Type Factor
        const vehicleTypeFactors = {
            'HATCHBACK': 1.0,
            'SEDAN': 1.2,
            'SUV': 1.5,
            'LUXURY': 2.0,
            'BIKE': 0.3
        };
        const typeFactor = vehicleTypeFactors[vehicleType] || 1.0;
        const typeAddition = product.base_price * (typeFactor - 1);
        premium += typeAddition;
        if (typeAddition > 0) breakdown['Vehicle Type Factor'] = typeAddition;

        // Vehicle Age Factor (Depreciation)
        if (vehicleAge) {
            const ageFactor = Math.max(0.5, 1 - (vehicleAge * 0.05));
            const ageAdjustment = premium * (1 - ageFactor);
            premium -= ageAdjustment;
            breakdown['Age Depreciation'] = -ageAdjustment;
        }

        // IDV (Insured Declared Value) Factor
        if (idv) {
            const idvPremium = idv * 0.03;
            premium += idvPremium;
            breakdown['IDV Coverage'] = idvPremium;
        }

        // City Factor (Metro cities have higher premiums)
        const cityFactors = {
            'METRO': 1.2,
            'TIER1': 1.1,
            'TIER2': 1.0
        };
        const cityFactor = cityFactors[city] || 1.0;
        if (cityFactor > 1) {
            const cityAddition = premium * (cityFactor - 1);
            premium += cityAddition;
            breakdown['City Factor'] = cityAddition;
        }

        // Driver Age Factor
        if (age < 25) {
            const youngDriverSurcharge = premium * 0.3;
            premium += youngDriverSurcharge;
            breakdown['Young Driver Surcharge'] = youngDriverSurcharge;
        } else if (age > 65) {
            const seniorSurcharge = premium * 0.2;
            premium += seniorSurcharge;
            breakdown['Senior Driver Surcharge'] = seniorSurcharge;
        }
    }

    // HEALTH INSURANCE CALCULATION
    else if (product.type === 'HEALTH') {
        const { preExistingConditions, familySize, smoker } = healthDetails || {};

        // Age Factor (Exponential after 45)
        if (age > 60) {
            const ageSurcharge = premium * 1.5;
            premium += ageSurcharge;
            breakdown['Senior Age Factor'] = ageSurcharge;
        } else if (age > 45) {
            const ageSurcharge = premium * 0.8;
            premium += ageSurcharge;
            breakdown['Age Factor'] = ageSurcharge;
        } else if (age > 30) {
            const ageSurcharge = premium * 0.3;
            premium += ageSurcharge;
            breakdown['Age Factor'] = ageSurcharge;
        }

        // Pre-existing Conditions
        if (preExistingConditions && preExistingConditions.length > 0) {
            const conditionSurcharge = premium * 0.4 * preExistingConditions.length;
            premium += conditionSurcharge;
            breakdown['Pre-existing Conditions'] = conditionSurcharge;
        }

        // Family Size Discount
        if (familySize && familySize > 1) {
            const familyDiscount = premium * 0.1 * (familySize - 1);
            premium -= familyDiscount;
            breakdown['Family Discount'] = -familyDiscount;
        }

        // Smoker Surcharge
        if (smoker) {
            const smokerSurcharge = premium * 0.25;
            premium += smokerSurcharge;
            breakdown['Smoker Surcharge'] = smokerSurcharge;
        }

        // Coverage Amount Factor
        if (coverageAmount) {
            const baseCoverage = 200000;
            if (coverageAmount > baseCoverage) {
                const extraUnits = (coverageAmount - baseCoverage) / 100000;
                const coveragePremium = premium * 0.15 * extraUnits;
                premium += coveragePremium;
                breakdown['Additional Coverage'] = coveragePremium;
            }
        }
    }

    // LIFE INSURANCE CALCULATION
    else if (product.type === 'LIFE') {
        const { sumAssured, policyTerm, smoker, occupation } = lifeDetails || {};

        // Age Factor
        const ageFactor = 1 + (age * 0.02);
        const ageAddition = premium * (ageFactor - 1);
        premium += ageAddition;
        breakdown['Age Factor'] = ageAddition;

        // Sum Assured Factor
        if (sumAssured) {
            const sumAssuredPremium = (sumAssured / 100000) * 100;
            premium += sumAssuredPremium;
            breakdown['Sum Assured'] = sumAssuredPremium;
        }

        // Policy Term Factor (Longer term = Lower annual premium)
        if (policyTerm) {
            const termDiscount = premium * (policyTerm / 100);
            premium -= termDiscount;
            breakdown['Term Discount'] = -termDiscount;
        }

        // Smoker Surcharge
        if (smoker) {
            const smokerSurcharge = premium * 0.5;
            premium += smokerSurcharge;
            breakdown['Smoker Surcharge'] = smokerSurcharge;
        }

        // Occupation Risk Factor
        const occupationRisks = {
            'LOW': 1.0,
            'MEDIUM': 1.2,
            'HIGH': 1.5
        };
        const occupationFactor = occupationRisks[occupation] || 1.0;
        if (occupationFactor > 1) {
            const occupationAddition = premium * (occupationFactor - 1);
            premium += occupationAddition;
            breakdown['Occupation Risk'] = occupationAddition;
        }
    }

    // General Coverage Amount Factor (if not already calculated)
    if (!breakdown['Additional Coverage'] && !breakdown['IDV Coverage'] && coverageAmount) {
        const baseCoverage = 100000;
        if (coverageAmount > baseCoverage) {
            const extraUnits = (coverageAmount - baseCoverage) / 100000;
            const coveragePremium = premium * 0.1 * extraUnits;
            premium += coveragePremium;
            breakdown['Coverage Amount'] = coveragePremium;
        }
    }

    // Round to 2 decimals
    premium = Math.round(premium * 100) / 100;

    // Round breakdown values
    Object.keys(breakdown).forEach(key => {
        breakdown[key] = Math.round(breakdown[key] * 100) / 100;
    });

    res.json({
        productId,
        productName: product.name,
        productType: product.type,
        premiumAmount: premium,
        breakdown: breakdown,
        coverageAmount: coverageAmount || product.coverage_max
    });
};
