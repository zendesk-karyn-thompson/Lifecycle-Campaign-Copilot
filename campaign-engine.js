// ============================================================================
// STANDARDIZED CAMPAIGN PLANNING ENGINE
// ============================================================================

// Campaign data model
let campaignData = {};
let validationResults = {};
let systemRecommendations = {};

// ============================================================================
// SECTION 1: DATA COLLECTION & NORMALIZATION
// ============================================================================

function collectCampaignData() {
    return {
        // Objective
        campaign_name: document.getElementById('campaignName').value || '',
        campaign_motion: document.getElementById('campaignMotion').value || '',
        source_of_truth: document.getElementById('sourceOfTruth').value || '',
        primary_goal: document.getElementById('primaryGoal').value || '',
        secondary_goal: document.getElementById('secondaryGoal').value || '',
        start_date: document.getElementById('startDate').value || '',
        end_date: document.getElementById('endDate').value || '',
        target_region: document.getElementById('targetRegion').value || '',

        // Audience
        audience_persona: document.getElementById('audiencePersona').value || '',
        audience_segment: document.getElementById('audienceSegment').value || '',
        lifecycle_stage: document.getElementById('lifecycleStage').value || '',
        audience_temperature: document.getElementById('audienceTemp').value || '',
        audience_size: document.getElementById('audienceSize').value || '',
        segmentation_notes: document.getElementById('segmentationNotes').value || '',

        // Strategy & Messaging
        source_documents: document.getElementById('sourceDocuments').value || '',
        value_propositions: document.getElementById('valuePropositions').value || '',
        proof_points: document.getElementById('proofPoints').value || '',
        messaging_input: document.getElementById('messagingInput').value || '',
        tone: document.getElementById('tone').value || '',
        cta_style: document.getElementById('ctaStyle').value || '',
        strategy_alignment: document.getElementById('strategyAlignment').value || '',

        // Execution
        channels_selected: document.getElementById('channelsSelected').value || '',
        dependencies: document.getElementById('dependencies').value || '',
        assumptions: document.getElementById('assumptions').value || '',

        // Measurement
        success_metric_input: document.getElementById('successMetricInput').value || '',
        baseline: document.getElementById('baseline').value || '',
        dashboard_link: document.getElementById('dashboardLink').value || '',
        tracking_notes: document.getElementById('trackingNotes').value || '',

        // CTA and Destination
        primary_cta: document.getElementById('primaryCTA').value || '',
        destination_url: document.getElementById('destinationURL').value || '',

        // Audience Exclusions
        exclude_customers: document.getElementById('exclude_customers').checked,
        exclude_partners: document.getElementById('exclude_partners').checked,
        exclude_opportunities: document.getElementById('exclude_opportunities').checked,
        exclude_trial: document.getElementById('exclude_trial').checked,
        exclude_startup: document.getElementById('exclude_startup').checked,
        exclude_mqls: document.getElementById('exclude_mqls').checked,
        exclude_csuite: document.getElementById('exclude_csuite').checked,

        // Asset Readiness
        lp_status: document.getElementById('lpStatus').value || '',
        creative_status: document.getElementById('creativeStatus').value || '',
        content_status: document.getElementById('contentStatus').value || '',
        webinar_status: document.getElementById('webinarStatus').value || '',
        working_docs_links: document.getElementById('workingDocsLinks').value || '',

        // Channel Details
        channel_role_notes: document.getElementById('channelRoleNotes').value || '',
        email_cadence: document.getElementById('emailCadence').value || '',
        blackout_dates: document.getElementById('blackoutDates').value || ''
    };
}

// ============================================================================
// SECTION 1.5: COMPLETENESS CHECK
// ============================================================================

function checkCompleteness(data) {
    const required = {
        'Moment Type': data.campaign_motion,
        'Campaign Name': data.campaign_name,
        'Source of Truth Link': data.source_of_truth,
        'Primary Goal': data.primary_goal && data.primary_goal.length >= 20,
        'Persona': data.audience_persona,
        'Lifecycle Stage': data.lifecycle_stage,
        'Target Region': data.target_region,
        'Value Propositions': data.value_propositions && data.value_propositions.length >= 20,
        'Strategy Alignment': data.strategy_alignment && data.strategy_alignment.length >= 20,
        'Primary CTA': data.primary_cta,
        'Destination URL': data.destination_url,
        'Landing Page Status': data.lp_status,
        'Creative Status': data.creative_status,
        'Content Status': data.content_status,
        'Start Date': data.start_date,
        'Channels Selected': data.channels_selected
    };

    const missing = [];
    for (const [field, value] of Object.entries(required)) {
        if (!value) {
            missing.push(field);
        }
    }

    const completeness = Math.round(((Object.keys(required).length - missing.length) / Object.keys(required).length) * 100);

    return {
        complete: missing.length === 0,
        completeness_score: completeness,
        missing_fields: missing
    };
}

// ============================================================================
// SECTION 2: VALIDATION & GOVERNANCE
// ============================================================================

function validateCampaign(data) {
    const issues = [];
    let scores = {
        clarity: 100,
        strategy: 100,
        messaging: 100,
        channel_fit: 100,
        measurement: 100
    };

    // Validate Clarity
    if (!data.primary_goal || data.primary_goal.length < 20) {
        issues.push('Primary goal is too vague or too short. Be more specific.');
        scores.clarity -= 30;
    }

    if (data.primary_goal.toLowerCase().includes('increase') &&
        !data.primary_goal.match(/\d+%/)) {
        issues.push('Goal mentions "increase" but lacks a specific target percentage.');
        scores.clarity -= 20;
    }

    if (!data.campaign_motion) {
        issues.push('Campaign motion not selected. This is required for strategic alignment.');
        scores.clarity -= 30;
    }

    // Validate Strategy
    if (!data.strategy_alignment || data.strategy_alignment.length < 20) {
        issues.push('Strategy alignment is missing or too vague.');
        scores.strategy -= 40;
    }

    if (!data.lifecycle_stage) {
        issues.push('Lifecycle stage not defined.');
        scores.strategy -= 20;
    }

    // Validate Audience
    if (data.audience_persona.toLowerCase().includes('all') ||
        data.audience_persona.toLowerCase().includes('everyone')) {
        issues.push('Audience is too broad. Narrow to a specific persona.');
        scores.strategy -= 30;
    }

    // Validate Messaging
    if (!data.value_propositions || data.value_propositions.length < 20) {
        issues.push('Value propositions are missing or insufficient.');
        scores.messaging -= 40;
    }

    if (!data.proof_points || data.proof_points.length < 10) {
        issues.push('Proof points are missing. Add customer stories, data, or case studies.');
        scores.messaging -= 25;
    }

    // Validate CTA alignment with audience temperature
    if (data.cta_style === 'Strong' && data.audience_temperature === 'Cold') {
        issues.push('CTA style is too aggressive for cold audience. Consider softer CTAs.');
        scores.messaging -= 20;
    }

    if (data.cta_style === 'Soft' && data.audience_temperature === 'Hot') {
        issues.push('CTA style is too weak for hot audience. Use stronger, direct CTAs.');
        scores.messaging -= 15;
    }

    // Validate Channels
    if (data.channels_selected) {
        const channelCount = data.channels_selected.split(',').length;
        if (channelCount > 5) {
            issues.push('Too many channels selected. Focus is critical for campaign success.');
            scores.channel_fit -= 25;
        }
    } else {
        issues.push('No channels selected. Define your distribution strategy.');
        scores.channel_fit -= 30;
    }

    // Validate Measurement
    if (!data.success_metric_input || data.success_metric_input.length < 15) {
        issues.push('Success metrics are undefined or too vague.');
        scores.measurement -= 40;
    }

    if (data.success_metric_input &&
        (data.success_metric_input.toLowerCase().includes('opens') ||
         data.success_metric_input.toLowerCase().includes('clicks')) &&
        !data.success_metric_input.toLowerCase().includes('conversion')) {
        issues.push('Measurement is activity-focused. Add outcome-based metrics like conversions or pipeline.');
        scores.measurement -= 20;
    }

    const overall = Math.round(
        (scores.clarity + scores.strategy + scores.messaging +
         scores.channel_fit + scores.measurement) / 5
    );

    return {
        scores: { ...scores, overall },
        issues: issues
    };
}

// ============================================================================
// SECTION 3: MOTION-SPECIFIC STRATEGY ENGINE
// ============================================================================

function getMotionStrategy(motion, data) {
    const strategies = {
        lifecycle: {
            focus: 'Staged journey progression over time',
            approach: 'Nurture sequencing with progressive engagement',
            channels: ['Email', 'In-product messaging', 'Retargeting', 'Web personalization'],
            execution_emphasis: 'Multi-touch email sequences, triggered messages based on behavior, progressive profiling',
            measurement_focus: 'Stage progression rate, engagement depth, time to MQL, reactivation rate',
            content_sequence: 'Awareness → Education → Consideration → Action'
        },
        demand_gen: {
            focus: 'Pipeline creation and acceleration',
            approach: 'Campaign burst with strong offer strategy',
            channels: ['Paid media', 'Email', 'Landing pages', 'Retargeting', 'Content syndication'],
            execution_emphasis: 'High-impact campaign bursts, gated content, clear conversion paths, SDR coordination',
            measurement_focus: 'MQLs generated, pipeline created, opportunity velocity, conversion rates',
            content_sequence: 'Value → Proof → Offer → Urgency'
        },
        regional: {
            focus: 'Local market relevance and regional performance',
            approach: 'Localized messaging with regional proof points',
            channels: ['Regional email', 'Local events', 'Regional partners', 'Localized content'],
            execution_emphasis: 'Translate and localize messaging, adapt proof points by region, coordinate with regional teams',
            measurement_focus: 'Regional pipeline, local engagement, market penetration by region',
            content_sequence: 'Local relevance → Regional proof → Local CTA'
        },
        global: {
            focus: 'Coordinated worldwide execution with local flexibility',
            approach: 'Global core with regional adaptation',
            channels: ['Global email', 'Paid media', 'Events', 'Regional customization'],
            execution_emphasis: 'Standardized global messaging with regional flexibility, centralized assets with local customization',
            measurement_focus: 'Global reach, regional performance comparison, consistency vs. adaptation balance',
            content_sequence: 'Universal value → Regional adaptation → Local proof'
        },
        event: {
            focus: 'Registration, attendance, and post-event conversion',
            approach: 'Pre-event, during-event, post-event phases',
            channels: ['Email', 'Event platform', 'Social', 'Retargeting', 'Follow-up sequences'],
            execution_emphasis: 'Registration campaign, reminder sequences, live engagement, post-event nurture',
            measurement_focus: 'Registration rate, attendance rate, engagement during event, post-event pipeline',
            content_sequence: 'Pre: Awareness → Value. During: Engagement. Post: Follow-up → Conversion'
        },
        product_launch: {
            focus: 'Market awareness and product adoption',
            approach: 'Teaser → Launch → Sustain phases',
            channels: ['Email', 'PR', 'Paid media', 'Web', 'Sales enablement', 'In-product'],
            execution_emphasis: 'Pre-launch teasers, coordinated launch burst, sustained adoption campaign',
            measurement_focus: 'Awareness lift, trial starts, feature adoption, initial conversion rate',
            content_sequence: 'Teaser: Intrigue → Launch: Value & Proof → Sustain: Adoption support'
        },
        expansion: {
            focus: 'Existing customer growth and value realization',
            approach: 'Use case expansion and growth signals',
            channels: ['Email', 'In-product', 'Customer success', 'Account-based'],
            execution_emphasis: 'Cross-sell/upsell messaging, value realization stories, usage-based triggers',
            measurement_focus: 'Expansion pipeline, upsell conversion, product adoption depth, NRR impact',
            content_sequence: 'Current value → Additional use cases → Expansion proof → Growth CTA'
        },
        re_engagement: {
            focus: 'Rebuilding interest and reactivation',
            approach: 'Light touch first, then stronger asks',
            channels: ['Email', 'Retargeting', 'Direct mail', 'Phone'],
            execution_emphasis: 'Value reminder, "we miss you" messaging, low-friction re-entry offers',
            measurement_focus: 'Reactivation rate, renewed engagement, re-qualified leads, win-back conversions',
            content_sequence: 'Reminder → Value recap → Easy re-entry → Support offer'
        }
    };

    return strategies[motion] || strategies.lifecycle;
}

// ============================================================================
// SECTION 4: MESSAGING ORDER LOGIC
// ============================================================================

function getMessagingOrder(lifecycleStage) {
    const hierarchies = {
        'Awareness': {
            order: ['Problem', 'Stakes', 'Value', 'Proof', 'CTA'],
            emphasis: 'Lead with the problem they face, explain why it matters, introduce your value'
        },
        'Consideration': {
            order: ['Value', 'Differentiation', 'Proof', 'CTA'],
            emphasis: 'Lead with clear value, show what makes you different, back it with proof'
        },
        'Conversion': {
            order: ['Offer', 'Proof', 'Urgency', 'Friction Removal', 'CTA'],
            emphasis: 'Clear offer first, prove it works, create urgency, remove barriers'
        },
        'Adoption': {
            order: ['Benefit', 'Use Case', 'Enablement', 'Proof', 'CTA'],
            emphasis: 'Show the benefit, provide specific use cases, enable them to succeed'
        },
        'Retention': {
            order: ['Risk or Lost Value', 'Value Reminder', 'Support Path', 'Proof', 'CTA'],
            emphasis: 'Show what they risk losing, remind them of value, offer support'
        },
        'Re-engagement': {
            order: ['Risk or Lost Value', 'Value Reminder', 'Support Path', 'Proof', 'CTA'],
            emphasis: 'Show what they risk losing, remind them of value, offer support'
        }
    };

    return hierarchies[lifecycleStage] || hierarchies['Awareness'];
}

// ============================================================================
// SECTION 5: CHANNEL RECOMMENDATION LOGIC
// ============================================================================

function getChannelRecommendations(motion, lifecycleStage, audienceTemp, audienceSize) {
    let primary = [];
    let supporting = [];
    let deprioritized = [];
    let missing = [];

    const selectedChannels = (campaignData.channels_selected || '').toLowerCase();

    // Define recommendations based on motion
    if (motion === 'lifecycle') {
        primary = ['Email', 'In-product messaging', 'Web personalization'];
        supporting = ['Retargeting', 'Push notifications'];
        deprioritized = ['Paid search', 'Display ads'];
    } else if (motion === 'demand_gen') {
        primary = ['Paid media', 'Email', 'Landing pages'];
        supporting = ['Content syndication', 'Retargeting', 'Webinars'];
        deprioritized = ['In-product messaging'];
    } else if (motion === 'event') {
        primary = ['Email', 'Event platform', 'Social media'];
        supporting = ['Retargeting', 'Partner promotion'];
        deprioritized = ['Display ads'];
    } else if (motion === 'product_launch') {
        primary = ['Email', 'Paid media', 'PR', 'Web'];
        supporting = ['Sales enablement', 'In-product', 'Social'];
        deprioritized = ['Direct mail'];
    } else if (motion === 'expansion') {
        primary = ['Email', 'In-product', 'Customer success outreach'];
        supporting = ['Account-based marketing', 'Webinars'];
        deprioritized = ['Broad paid media'];
    } else if (motion === 're_engagement') {
        primary = ['Email', 'Retargeting', 'Direct mail'];
        supporting = ['Phone outreach', 'Special offers'];
        deprioritized = ['Broad campaigns'];
    } else {
        primary = ['Email', 'Paid media', 'Web'];
        supporting = ['Social', 'Content'];
        deprioritized = [];
    }

    // Adjust based on audience temperature
    if (audienceTemp === 'Hot') {
        if (!selectedChannels.includes('sales')) {
            missing.push('Sales coordination for high-intent leads');
        }
    }

    // Check for missing primary channels
    primary.forEach(channel => {
        if (!selectedChannels.includes(channel.toLowerCase())) {
            missing.push(channel);
        }
    });

    return { primary, supporting, deprioritized, missing };
}

// ============================================================================
// SECTION 6: KPI / MEASUREMENT RECOMMENDATIONS
// ============================================================================

function getKPIRecommendations(motion, lifecycleStage, primaryGoal) {
    let primary = '';
    let secondary = [];
    let guardrails = [];

    // Determine primary KPI based on lifecycle stage
    if (lifecycleStage === 'Awareness') {
        primary = 'Reach and engagement rate';
        secondary = ['Click-through rate', 'Content consumption', 'Brand awareness lift'];
        guardrails = ['Bounce rate', 'Unsubscribe rate'];
    } else if (lifecycleStage === 'Consideration') {
        primary = 'Content engagement and MQL creation';
        secondary = ['Click-through rate', 'Time on site', 'Downloads'];
        guardrails = ['Engagement quality score', 'Lead score distribution'];
    } else if (lifecycleStage === 'Conversion') {
        primary = 'Conversion rate and pipeline created';
        secondary = ['Demo requests', 'Trial starts', 'Opportunity creation'];
        guardrails = ['Sales acceptance rate', 'Time to conversion'];
    } else if (lifecycleStage === 'Adoption') {
        primary = 'Feature adoption rate and activation';
        secondary = ['Product usage depth', 'Time to value', 'User engagement'];
        guardrails = ['Churn risk signals', 'Support ticket volume'];
    } else if (lifecycleStage === 'Retention' || lifecycleStage === 'Re-engagement') {
        primary = 'Reactivation rate and renewed engagement';
        secondary = ['Win-back conversions', 'Re-qualification rate', 'Engagement recovery'];
        guardrails = ['Permanent opt-outs', 'Negative sentiment'];
    }

    // Override based on motion if needed
    if (motion === 'demand_gen') {
        primary = 'Pipeline created and MQLs generated';
        secondary = ['Opportunity velocity', 'Conversion rate', 'Influenced pipeline'];
    } else if (motion === 'product_launch') {
        primary = 'Awareness lift and trial starts';
        secondary = ['Feature adoption', 'Initial conversion rate', 'Market penetration'];
    } else if (motion === 'expansion') {
        primary = 'Expansion pipeline and upsell conversion';
        secondary = ['Cross-sell rate', 'Product adoption depth', 'NRR impact'];
    }

    return { primary, secondary, guardrails };
}

// ============================================================================
// SECTION 7: SYSTEM RECOMMENDATIONS
// ============================================================================

function generateSystemRecommendations(data, validation) {
    const motion = data.campaign_motion;
    const motionStrategy = getMotionStrategy(motion, data);
    const channels = getChannelRecommendations(
        motion,
        data.lifecycle_stage,
        data.audience_temperature,
        data.audience_size
    );
    const kpis = getKPIRecommendations(motion, data.lifecycle_stage, data.primary_goal);
    const messagingOrder = getMessagingOrder(data.lifecycle_stage);

    let launchReadiness = 'READY';
    if (validation.scores.overall < 70) {
        launchReadiness = 'NOT READY - Address critical issues first';
    } else if (validation.scores.overall < 85) {
        launchReadiness = 'READY WITH CAVEATS - Review recommendations';
    }

    return {
        recommended_motion: motion,
        why_this_motion: `${motionStrategy.focus}`,
        recommended_strategy: motionStrategy.approach,
        recommended_channel_mix: `Primary: ${channels.primary.join(', ')}. Supporting: ${channels.supporting.join(', ')}.`,
        recommended_cta_strength: getCTARecommendation(data.audience_temperature, data.lifecycle_stage),
        recommended_content_sequence: messagingOrder.order.join(' → '),
        recommended_kpi_structure: {
            primary: kpis.primary,
            secondary: kpis.secondary,
            guardrails: kpis.guardrails
        },
        key_gaps: validation.issues.slice(0, 3),
        launch_readiness: launchReadiness,
        missing_channels: channels.missing
    };
}

function getCTARecommendation(temp, stage) {
    if (temp === 'Hot' && (stage === 'Conversion' || stage === 'Adoption')) {
        return 'Strong - Direct, action-oriented CTAs (Buy, Start, Upgrade)';
    } else if (temp === 'Warm') {
        return 'Moderate - Balanced CTAs (Try, See how, Get started)';
    } else {
        return 'Soft - Educational CTAs (Learn more, Explore, Read)';
    }
}

// ============================================================================
// SECTION 8: OUTPUT GENERATION
// ============================================================================

function generateExecutivePlan(data, recommendations) {
    const motionStrategy = getMotionStrategy(data.campaign_motion, data);

    return `
        <div class="output-box">
            <h3>Strategy / Program Overview <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="4" id="outputOverview">${data.campaign_name} is a ${data.campaign_motion ? data.campaign_motion.replace('_', ' ') : 'campaign'} designed to ${data.primary_goal.toLowerCase()}.

Targeting ${data.audience_persona} at the ${data.lifecycle_stage} stage, this campaign will deliver value through ${data.channels_selected || 'defined channels'}.

Strategic Approach: ${motionStrategy.approach}

Timeline: ${data.start_date || 'TBD'} to ${data.end_date || 'TBD'}${data.target_region ? '. Region: ' + data.target_region : ''}</textarea>
        </div>

        <div class="output-box">
            <h3>Target Audience <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="4" id="outputAudience">Primary Persona: ${data.audience_persona}
Lifecycle Stage: ${data.lifecycle_stage}
Temperature: ${data.audience_temperature}
${data.audience_size ? 'Size: ' + data.audience_size + ' contacts' : ''}

Segment: ${data.audience_segment || 'Define segment criteria'}
${data.segmentation_notes ? '\n' + data.segmentation_notes : ''}</textarea>
        </div>

        <div class="output-box">
            <h3>2026 Focus Areas / Messaging Hierarchy <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="6" id="outputFocus">${data.messaging_input || 'Primary Message: ' + data.primary_goal + '\n\nSupporting Messages:\n- ' + data.value_propositions + '\n\nProof Points:\n- ' + (data.proof_points || 'Customer success stories\n- ROI data and metrics\n- Industry benchmarks')}</textarea>
        </div>

        <div class="output-box">
            <h3>Marketing Strategy Alignment <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="3" id="outputAlignment">${data.strategy_alignment}</textarea>
        </div>

        <div class="output-box">
            <h3>Success Metrics <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="outputMetrics">Primary KPI: ${data.primary_goal}

${data.success_metric_input || 'Secondary Metrics:\n- Email engagement (open, click, reply rates)\n- Website engagement and time on site\n- Content downloads and consumption\n- Campaign influence on pipeline'}

System Recommended KPIs:
Primary: ${recommendations.recommended_kpi_structure.primary}
Secondary: ${recommendations.recommended_kpi_structure.secondary.join(', ')}</textarea>
        </div>

        <div class="output-box">
            <h3>Key Callouts & Risks <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="4" id="outputCallouts">${data.dependencies ? '⚠️ ' + data.dependencies + '\n\n' : ''}✅ Test messaging with target personas before launch
✅ Set up tracking for all key metrics
✅ ${data.audience_temperature === 'Cold' ? 'Cold audience requires more nurturing touches' : data.audience_temperature === 'Hot' ? 'Hot audience needs fast follow-up' : 'Warm audience is ready for balanced approach'}

${validationResults.issues.length > 0 ? '\n⚠️ Issues to address:\n' + validationResults.issues.slice(0, 3).map(i => '- ' + i).join('\n') : ''}</textarea>
        </div>

        <div class="output-box">
            <h3>Links & Resources <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="2" id="outputLinks">${data.source_documents ? 'MSD: ' + data.source_documents : 'Add links to related resources, docs, or assets'}</textarea>
        </div>
    `;
}

function generateSlides(data, recommendations) {
    const timeline = data.campaign_motion === 'product_launch' ? '6-12 weeks' :
                     data.campaign_motion === 're_engagement' ? '2-4 weeks' :
                     data.campaign_motion === 'lifecycle' ? '8-12 weeks' : '4-8 weeks';

    return `
        <div class="output-box">
            <h3>Slide 1: The Opportunity <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="slide1">THE OPPORTUNITY

• Campaign: ${data.campaign_name}
• Goal: ${data.primary_goal}
• Why Now: ${data.audience_persona} at ${data.lifecycle_stage} stage showing ${data.audience_temperature.toLowerCase()} engagement
• Market opportunity and timing${data.target_region ? '\n• Region: ' + data.target_region : ''}</textarea>
        </div>

        <div class="output-box">
            <h3>Slide 2: Target Audience <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="slide2">TARGET AUDIENCE

• Who: ${data.audience_persona}${data.audience_segment ? ' (' + data.audience_segment + ')' : ''}
${data.audience_size ? '• Size: ' + data.audience_size + ' contacts' : ''}
• Temperature: ${data.audience_temperature}
• Stage: ${data.lifecycle_stage}
• Why they're ready now: ${data.audience_temperature === 'Hot' ? 'High intent, ready to act' : data.audience_temperature === 'Warm' ? 'Aware and interested' : 'Building awareness'}</textarea>
        </div>

        <div class="output-box">
            <h3>Slide 3: Strategy <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="slide3">STRATEGY

• Program: ${data.campaign_motion ? data.campaign_motion.replace('_', ' ').toUpperCase() : 'Campaign Motion'}
• Messages: ${data.value_propositions}
• Proof points: ${data.proof_points || 'Customer success, data, case studies'}
• Strategic alignment: ${data.strategy_alignment}</textarea>
        </div>

        <div class="output-box">
            <h3>Slide 4: Execution <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="slide4">EXECUTION

• Channels: ${data.channels_selected || recommendations.recommended_channel_mix}
• Timeline: ${timeline}
• Content approach: ${data.tone || 'Professional'} tone with ${data.cta_style || 'Moderate'} CTAs
• Launch date: ${data.start_date || 'TBD'}</textarea>
        </div>

        <div class="output-box">
            <h3>Slide 5: Results <span style="font-size: 12px; color: #9ca3af; font-weight: normal;">(editable)</span></h3>
            <textarea rows="5" id="slide5">EXPECTED RESULTS

• Target: ${data.primary_goal}
• Timeline: ${timeline}
• Success metrics: ${data.success_metric_input || recommendations.recommended_kpi_structure.primary}
• Next steps: Build, test, launch</textarea>
        </div>
    `;
}

function generateAIPrompts(data, recommendations) {
    const emailCount = data.campaign_motion === 're_engagement' ? '2-3' :
                       data.campaign_motion === 'lifecycle' ? '5-7' :
                       data.campaign_motion === 'product_launch' ? '3-5' : '3-4';

    const tone = data.campaign_motion === 'product_launch' ? 'exciting and direct' :
                 data.campaign_motion === 're_engagement' ? 'empathetic and value-reminding' :
                 data.campaign_motion === 'lifecycle' ? 'educational and helpful' : 'professional and strategic';

    const msdContext = data.source_documents ? `\n\nMarketing Source Document Context:\n${data.source_documents}\n\nIMPORTANT: Use this MSD content to inform messaging and ensure alignment with approved positioning.` : '';

    const emailPrompt = `You are a lifecycle marketing expert. Write ${emailCount} emails for a ${data.campaign_motion ? data.campaign_motion.replace('_', ' ') : 'marketing'} campaign.

Target Audience: ${data.audience_persona}
Lifecycle Stage: ${data.lifecycle_stage}
Audience Temperature: ${data.audience_temperature}
Campaign Goal: ${data.primary_goal}
Key Messages: ${data.value_propositions}
Proof Points: ${data.proof_points || 'Customer success stories and ROI data'}${msdContext}

Requirements:
- Tone: ${tone}
- Email length: 200-300 words each
- ${data.audience_temperature === 'Hot' ? 'Use strong CTAs and reference high-intent behaviors' : data.audience_temperature === 'Warm' ? 'Use moderate CTAs and acknowledge their stage' : 'Use soft CTAs focused on education'}
- Personalize with ${data.audience_temperature} audience in mind
${data.source_documents ? '- Align messaging with the MSD context provided above' : ''}

For each email provide:
1. Subject line
2. Email body
3. Primary CTA

Format the output clearly with email numbers.`;

    const subjectPrompt = `Generate 10 subject line options for a ${data.campaign_motion ? data.campaign_motion.replace('_', ' ') : 'marketing'} email campaign.

Context:
- Target: ${data.audience_persona} (${data.audience_temperature} audience)
- Goal: ${data.primary_goal}
- Tone: ${tone}
- Key value: ${data.value_propositions}${msdContext}

Make them ${data.campaign_motion === 'product_launch' ? 'exciting and benefit-focused' : data.campaign_motion === 'lifecycle' ? 'curiosity-driven and educational' : data.campaign_motion === 're_engagement' ? 'value-reminding and supportive' : 'professional and direct'}.${data.source_documents ? '\nEnsure messaging aligns with the MSD context provided.' : ''}`;

    const contentPrompt = `Create campaign content for: ${data.campaign_name}

Campaign Details:
- Type: ${data.campaign_motion ? data.campaign_motion.replace('_', ' ') : 'Campaign'}
- Goal: ${data.primary_goal}
- Audience: ${data.audience_persona} (${data.lifecycle_stage}, ${data.audience_temperature})
- Key Messages: ${data.value_propositions}
- Proof: ${data.proof_points || 'Customer stories and data'}
- Tone: ${tone}${msdContext}

Please create:
1. Campaign landing page copy (hero, benefits, social proof, CTA)
2. 3 blog post titles related to ${data.value_propositions}
3. 5 social media posts (LinkedIn tone)
4. In-product message copy (50 words max)

Make all content ${tone} in tone and appropriate for ${data.audience_temperature.toLowerCase()} audience.${data.source_documents ? '\n\nIMPORTANT: Base all messaging on the MSD context provided above to ensure brand and product positioning alignment.' : ''}`;

    return `
        <div style="background: white; border: 2px solid #D1F470; border-radius: 8px; padding: 20px; margin-bottom: 20px; position: relative;">
            <button class="btn-primary" style="position: absolute; top: 12px; right: 12px; padding: 6px 12px; font-size: 12px;" onclick="copyPrompt('emailPrompt')">Copy</button>
            <h4 style="color: #2D4C33; margin-bottom: 12px; font-size: 14px;">📧 Email Sequence Generator</h4>
            <pre style="font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; padding-right: 80px; color: #11110D;" id="emailPrompt">${emailPrompt}</pre>
        </div>

        <div style="background: white; border: 2px solid #D1F470; border-radius: 8px; padding: 20px; margin-bottom: 20px; position: relative;">
            <button class="btn-primary" style="position: absolute; top: 12px; right: 12px; padding: 6px 12px; font-size: 12px;" onclick="copyPrompt('subjectPrompt')">Copy</button>
            <h4 style="color: #2D4C33; margin-bottom: 12px; font-size: 14px;">✉️ Subject Line Generator</h4>
            <pre style="font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; padding-right: 80px; color: #11110D;" id="subjectPrompt">${subjectPrompt}</pre>
        </div>

        <div style="background: white; border: 2px solid #D1F470; border-radius: 8px; padding: 20px; margin-bottom: 20px; position: relative;">
            <button class="btn-primary" style="position: absolute; top: 12px; right: 12px; padding: 6px 12px; font-size: 12px;" onclick="copyPrompt('contentPrompt')">Copy</button>
            <h4 style="color: #2D4C33; margin-bottom: 12px; font-size: 14px;">📝 Campaign Content Generator</h4>
            <pre style="font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; padding-right: 80px; color: #11110D;" id="contentPrompt">${contentPrompt}</pre>
        </div>

        <div class="callout-box">
            <strong>💡 How to Use These Prompts:</strong> Copy a prompt above and paste it into ChatGPT, Claude, or any AI tool. The AI will generate campaign-ready content you can refine and use.
        </div>
    `;
}

// ============================================================================
// SECTION 9: UI CONTROL FUNCTIONS
// ============================================================================

function showSection(sectionId) {
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');

    const tabMap = {
        'inputs': 0, 'validation': 1, 'recommendations': 2,
        'execplan': 3, 'slides': 4, 'prompts': 5
    };

    const tabs = document.querySelectorAll('.tab');
    if (tabMap[sectionId] !== undefined) {
        tabs[tabMap[sectionId]].classList.add('active');
    }

    window.scrollTo(0, 0);
}

function handleMotionChange() {
    const motion = document.getElementById('campaignMotion').value;
    // Could add motion-specific UI hints here
}

function generatePlan() {
    // Collect data
    campaignData = collectCampaignData();

    // Check completeness first
    const completenessCheck = checkCompleteness(campaignData);

    if (!completenessCheck.complete) {
        alert(`⚠️ Campaign definition is ${completenessCheck.completeness_score}% complete.\n\nMissing required fields:\n• ${completenessCheck.missing_fields.join('\n• ')}\n\nPlease fill in all required fields before generating.`);
        return;
    }

    // Validate
    validationResults = validateCampaign(campaignData);

    // Generate recommendations
    systemRecommendations = generateSystemRecommendations(campaignData, validationResults);

    // Display scoring
    displayScoring();

    // Display recommendations
    displayRecommendations();

    // Generate outputs
    document.getElementById('execPlanOutput').innerHTML = generateExecutivePlan(campaignData, systemRecommendations);
    document.getElementById('slidesOutput').innerHTML = generateSlides(campaignData, systemRecommendations);
    document.getElementById('promptsOutput').innerHTML = generateAIPrompts(campaignData, systemRecommendations);

    // Navigate to validation
    showSection('validation');
}

function displayScoring() {
    document.getElementById('clarityScore').textContent = validationResults.scores.clarity;
    document.getElementById('strategyScore').textContent = validationResults.scores.strategy;
    document.getElementById('messagingScore').textContent = validationResults.scores.messaging;
    document.getElementById('channelScore').textContent = validationResults.scores.channel_fit;
    document.getElementById('measurementScore').textContent = validationResults.scores.measurement;
    document.getElementById('overallScore').textContent = validationResults.scores.overall;

    // Display issues if any
    const issuesContainer = document.getElementById('issuesContainer');
    if (validationResults.issues.length > 0) {
        issuesContainer.innerHTML = `
            <div class="issues-list">
                <h4>Issues to Address:</h4>
                <ul>
                    ${validationResults.issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        issuesContainer.innerHTML = `
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px;">
                <h4 style="color: #065f46;">✅ No critical issues detected</h4>
                <p style="color: #065f46; font-size: 13px;">Campaign definition is strong. Review recommendations for optimization opportunities.</p>
            </div>
        `;
    }
}

function displayRecommendations() {
    const html = `
        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 20px;">Strategic Recommendations</h3>

        <div class="recommendation-section">
            <strong>Recommended Campaign Motion</strong>
            <p>${systemRecommendations.recommended_motion ? systemRecommendations.recommended_motion.replace('_', ' ').toUpperCase() : 'Not defined'}</p>
            <p style="margin-top: 4px; font-style: italic;">${systemRecommendations.why_this_motion}</p>
        </div>

        <div class="recommendation-section">
            <strong>Recommended Strategy</strong>
            <p>${systemRecommendations.recommended_strategy}</p>
        </div>

        <div class="recommendation-section">
            <strong>Recommended Channel Mix</strong>
            <p>${systemRecommendations.recommended_channel_mix}</p>
            ${systemRecommendations.missing_channels.length > 0 ? `<p style="margin-top: 8px; color: #b91c1c;">⚠️ Consider adding: ${systemRecommendations.missing_channels.join(', ')}</p>` : ''}
        </div>

        <div class="recommendation-section">
            <strong>Recommended CTA Strength</strong>
            <p>${systemRecommendations.recommended_cta_strength}</p>
        </div>

        <div class="recommendation-section">
            <strong>Recommended Content Sequence</strong>
            <p>${systemRecommendations.recommended_content_sequence}</p>
        </div>

        <div class="recommendation-section">
            <strong>Recommended KPI Structure</strong>
            <p><strong>Primary:</strong> ${systemRecommendations.recommended_kpi_structure.primary}</p>
            <p><strong>Secondary:</strong> ${systemRecommendations.recommended_kpi_structure.secondary.join(', ')}</p>
            <p><strong>Guardrails:</strong> ${systemRecommendations.recommended_kpi_structure.guardrails.join(', ')}</p>
        </div>

        ${systemRecommendations.key_gaps.length > 0 ? `
        <div class="recommendation-section">
            <strong>Key Gaps to Address</strong>
            <ul style="margin-top: 8px; padding-left: 20px;">
                ${systemRecommendations.key_gaps.map(gap => `<li style="margin-bottom: 4px;">${gap}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        <div class="recommendation-section" style="background: ${systemRecommendations.launch_readiness.includes('NOT READY') ? '#fef2f2' : systemRecommendations.launch_readiness.includes('CAVEATS') ? '#fef3c7' : '#d1fae5'}; padding: 12px; border-radius: 6px; margin-top: 16px;">
            <strong>Launch Readiness</strong>
            <p style="font-size: 14px; font-weight: 600;">${systemRecommendations.launch_readiness}</p>
        </div>
    `;

    document.getElementById('recommendationsPanel').innerHTML = html;
}

function copyPrompt(id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    });
}

function resetTool() {
    if (confirm('Start a new campaign? This will clear all data.')) {
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.type !== 'button') el.value = '';
        });
        campaignData = {};
        validationResults = {};
        systemRecommendations = {};
        showSection('inputs');
    }
}

// Auto-save
setInterval(() => {
    const data = collectCampaignData();
    localStorage.setItem('campaignData', JSON.stringify(data));
}, 10000);

// Load saved data
window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('campaignData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.keys(data).forEach(key => {
            const fieldMap = {
                'campaign_name': 'campaignName',
                'campaign_motion': 'campaignMotion',
                'campaign_type': 'campaignType',
                'primary_goal': 'primaryGoal',
                'secondary_goal': 'secondaryGoal',
                'start_date': 'startDate',
                'end_date': 'endDate',
                'target_region': 'targetRegion',
                'audience_persona': 'audiencePersona',
                'audience_segment': 'audienceSegment',
                'lifecycle_stage': 'lifecycleStage',
                'audience_temperature': 'audienceTemp',
                'audience_size': 'audienceSize',
                'segmentation_notes': 'segmentationNotes',
                'source_documents': 'sourceDocuments',
                'value_propositions': 'valuePropositions',
                'proof_points': 'proofPoints',
                'messaging_input': 'messagingInput',
                'tone': 'tone',
                'cta_style': 'ctaStyle',
                'strategy_alignment': 'strategyAlignment',
                'channels_selected': 'channelsSelected',
                'dependencies': 'dependencies',
                'assumptions': 'assumptions',
                'success_metric_input': 'successMetricInput'
            };

            const elementId = fieldMap[key];
            if (elementId) {
                const el = document.getElementById(elementId);
                if (el) el.value = data[key];
            }
        });
    }
});
