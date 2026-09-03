/**
 * OpenRouter / DeepSeek AI integration for patent analysis and modernization.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_IMAGE_API_URL = 'https://openrouter.ai/api/v1/images';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

function getAiConfig(): { apiKey: string; url: string; model: string; provider: string } {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      url: OPENROUTER_API_URL,
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash',
      provider: 'OpenRouter',
    };
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      apiKey: process.env.DEEPSEEK_API_KEY,
      url: DEEPSEEK_API_URL,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      provider: 'DeepSeek',
    };
  }
  throw new Error('OPENROUTER_API_KEY or DEEPSEEK_API_KEY environment variable is required');
}

function getOpenRouterApiKey(): string {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for image generation');
  }
  return process.env.OPENROUTER_API_KEY;
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: {
    message: string;
    code: number;
  };
}

interface ModernizationSuggestion {
  aspect: string;
  original: string;
  modernized: string;
  material: string;
  technicalDetail?: string;
}

interface PatentAnalysis {
  modernizations: ModernizationSuggestion[];
  properties: {
    torque: string;
    stress: string;
    material: string;
    expiryYear: number;
  };
  thoughtLog: Array<{
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>;
  blueprintDescription: string;
}

/**
 * Call OpenRouter first, or DeepSeek directly when OpenRouter is not configured.
 */
async function callGeminiApi(prompt: string): Promise<string> {
  const config = getAiConfig();
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...(config.provider === 'OpenRouter' ? { 'HTTP-Referer': 'https://github.com/AryanSaxenaa/renaissance', 'X-Title': 'RenaissanceAI' } : {}),
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: {
        type: 'text',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${config.provider} API error: ${response.status} - ${errorText}`);
  }

  const data: ChatResponse = await response.json();

  if (data.error) {
    throw new Error(`${config.provider} API error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`No response from ${config.provider} API`);
  }

  return text;
}

/**
 * Analyze an expired patent and generate modernization suggestions using Gemini AI
 */
export async function analyzePatentWithGemini(patent: {
  patentId: string;
  title: string;
  abstract: string;
  claims: string[];
  division: string;
  expiryYear: number;
}): Promise<PatentAnalysis> {
  const thoughtLog: PatentAnalysis['thoughtLog'] = [];
  const now = Date.now();

  // Log the start
  thoughtLog.push({
    timestamp: new Date(now),
    message: 'INITIALIZING DEEPSEEK AI ANALYSIS ENGINE...',
    type: 'info',
  });

  thoughtLog.push({
    timestamp: new Date(now + 100),
    message: `LOADING PATENT DATA: ${patent.patentId}`,
    type: 'info',
  });

  // Create the analysis prompt
  const prompt = `You are a Principal Mechanical Engineer and Materials Scientist specializing in modernizing expired patents for high-performance applications.
  
  TASK: Analyze this expired patent and create a comprehensive modernization plan.
  
  PATENT DATA:
  ID: ${patent.patentId}
  TITLE: ${patent.title}
  ABSTRACT: ${patent.abstract}
  DIVISION: ${patent.division}
  CLAIMS (Excerpt): ${patent.claims.slice(0, 5).join('\n')}
  
  Provide your analysis in the following JSON format ONLY (no markdown):
  {
    "modernizations": [
      {
        "aspect": "Specific component/subsystem (e.g., 'Main Drive Shaft', 'Housing Casing')",
        "original": "Likely original material/method (e.g., 'Cast Iron', 'Analog Dial')",
        "modernized": "Modern engineering equivalent (e.g., 'Carbon PEEK Composite', 'Digital Twin Interface')",
        "material": "Specific material grade (e.g., 'Ti-6Al-4V Grade 5', 'Toray T1100G Carbon Fiber')",
        "technicalDetail": "Deep technical justification (2 sentences). Explain WHY this is better: weight reduction %, efficiency gain, fatigue life improvement."
      }
    ],
    "properties": {
      "torque": "Estimated torque capacity (e.g., '450 Nm @ 3000 RPM')",
      "stress": "Max working stress (e.g., '250 MPa (Yield)')",
      "material": "Primary structural material",
      "expiryYear": ${patent.expiryYear}
    },
    "blueprintDescription": "A highly detailed engineering description of the modernized device, focusing on physical geometry, layout, and visible mechanisms for a technical artist."
  }
  
  REQUIREMENTS:
  1. Provide exactly 3 modernization suggestions.
  2. Be ultra-specific with materials (use grades/alloys).
  3. Focus on:
     - Weight reduction (Lightweighting)
     - Smart materials / IoT integration
     - Advanced manufacturing (DMLS, Filament Winding)`;

  thoughtLog.push({
    timestamp: new Date(now + 200),
    message: 'SENDING PATENT DATA TO AI ANALYSIS ENGINE...',
    type: 'info',
  });

  try {
    const response = await callGeminiApi(prompt);

    thoughtLog.push({
      timestamp: new Date(now + 500),
      message: 'AI RESPONSE RECEIVED',
      type: 'success',
    });

    thoughtLog.push({
      timestamp: new Date(now + 600),
      message: 'PARSING MODERNIZATION MATRIX...',
      type: 'info',
    });

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = response;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonStr);

    thoughtLog.push({
      timestamp: new Date(now + 700),
      message: `IDENTIFIED ${analysis.modernizations?.length || 0} MODERNIZATION OPPORTUNITIES`,
      type: 'success',
    });

    thoughtLog.push({
      timestamp: new Date(now + 800),
      message: 'CALCULATING ENGINEERING SPECIFICATIONS...',
      type: 'info',
    });

    thoughtLog.push({
      timestamp: new Date(now + 900),
      message: 'GENERATING TECHNICAL BLUEPRINT PARAMETERS...',
      type: 'info',
    });

    thoughtLog.push({
      timestamp: new Date(now + 1000),
      message: 'AI ANALYSIS COMPLETE. REMIX VIABILITY: HIGH',
      type: 'success',
    });

    // Ensure we have valid modernizations array
    const modernizations: ModernizationSuggestion[] = (analysis.modernizations || []).map((m: any) => ({
      aspect: m.aspect || 'Component',
      original: m.original || 'Original specification',
      modernized: m.modernized || 'Modern equivalent',
      material: m.material || 'Advanced composite',
      technicalDetail: m.technicalDetail || 'Improved performance through modern engineering principles.',
    }));

    // Ensure we have exactly 3 modernizations
    while (modernizations.length < 3) {
      modernizations.push({
        aspect: 'Control System',
        original: 'Manual operation',
        modernized: 'IoT-enabled digital control',
        material: 'Embedded microcontroller',
        technicalDetail: 'Enables remote monitoring and real-time telemetry adjustment.',
      });
    }

    return {
      modernizations: modernizations.slice(0, 3),
      properties: {
        torque: analysis.properties?.torque || '450 Nm',
        stress: analysis.properties?.stress || '250 MPa',
        material: analysis.properties?.material || modernizations[0].material,
        expiryYear: patent.expiryYear,
      },
      thoughtLog,
      blueprintDescription: analysis.blueprintDescription || `Modernized ${patent.title} with advanced materials`,
    };
  } catch (error) {
    console.error('[Gemini AI] Analysis error:', error);

    thoughtLog.push({
      timestamp: new Date(now + 500),
      message: `AI ANALYSIS ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error',
    });

    thoughtLog.push({
      timestamp: new Date(now + 600),
      message: 'FALLING BACK TO HEURISTIC ANALYSIS...',
      type: 'warning',
    });

    // Provide fallback analysis
    return generateFallbackAnalysis(patent, thoughtLog);
  }
}

/**
 * Generate a fallback analysis when AI fails
 */
function generateFallbackAnalysis(
  patent: { division: string; expiryYear: number; title: string },
  thoughtLog: PatentAnalysis['thoughtLog']
): PatentAnalysis {
  const divisionModernizations: Record<string, ModernizationSuggestion[]> = {
    MECH_ENG: [
      { aspect: 'Primary Structure', original: 'Cast iron/steel', modernized: 'Ti-6Al-4V Titanium Alloy', material: 'Grade 5 Titanium', technicalDetail: 'Provides 40% weight reduction with superior corrosion resistance.' },
      { aspect: 'Manufacturing', original: 'Sand casting', modernized: 'Direct Metal Laser Sintering', material: 'DMLS Process', technicalDetail: 'Allows for complex lattice structures that are impossible to cast.' },
      { aspect: 'Bearings', original: 'Bronze bushings', modernized: 'Ceramic ball bearings', material: 'Silicon Nitride (Si3N4)', technicalDetail: 'Reduces friction by 90% and allows for unlubricated operation.' },
    ],
    FLUID_DYN: [
      { aspect: 'Impeller', original: 'Bronze casting', modernized: 'Carbon fiber reinforced polymer', material: 'CFRP Composite', technicalDetail: 'Reduces rotational inertia for faster spin-up and lower energy consumption.' },
      { aspect: 'Sealing', original: 'Mechanical packing', modernized: 'Magnetic coupling', material: 'NdFeB Rare Earth', technicalDetail: 'Hermetic seal prevents any fluid leakage and eliminates hazardous emissions.' },
      { aspect: 'Monitoring', original: 'Pressure gauge', modernized: 'IoT sensor array', material: 'MEMS Sensors', technicalDetail: 'Provides real-time pressure, flow, and vibration data to cloud dashboard.' },
    ],
    THERMO_ENG: [
      { aspect: 'Heat Exchanger', original: 'Copper tubes', modernized: 'Graphene-enhanced aluminum', material: 'Graphene/Al Composite', technicalDetail: 'Increases thermal conductivity by 200% while reducing weight.' },
      { aspect: 'Insulation', original: 'Fiberglass', modernized: 'Aerogel blanket', material: 'Silica Aerogel', technicalDetail: 'Lowest thermal conductivity solid, allowing thinner insulation layers.' },
      { aspect: 'Controls', original: 'Thermostat', modernized: 'PID digital controller', material: 'ARM Microcontroller', technicalDetail: 'Precise temperature control prevents overshoot and cycling losses.' },
    ],
    INSTRUM: [
      { aspect: 'Sensor', original: 'Mechanical transducer', modernized: 'MEMS piezoelectric', material: 'PZT Ceramic', technicalDetail: 'High sensitivity and ultra-compact form factor.' },
      { aspect: 'Display', original: 'Analog meter', modernized: 'OLED touchscreen', material: 'Flexible AMOLED', technicalDetail: 'High-resolution visualization of complex data streams.' },
      { aspect: 'Communication', original: 'Wired signal', modernized: 'Wireless IoT (LoRaWAN)', material: 'SX1276 Module', technicalDetail: 'Long-range low-power connectivity for remote deployment.' },
    ],
    HYDRAUL: [
      { aspect: 'Cylinder', original: 'Steel tube', modernized: 'Carbon fiber overwrap', material: 'T700 Carbon Fiber', technicalDetail: 'High pressure rating with minimal weight penalty.' },
      { aspect: 'Seals', original: 'Rubber O-rings', modernized: 'Fluoroelastomer seals', material: 'Viton FKM', technicalDetail: 'Superior chemical and temperature resistance for harsh environments.' },
      { aspect: 'Valve', original: 'Manual spool', modernized: 'Proportional solenoid', material: 'Hardened SS', technicalDetail: 'Precise flow control with millisecond response time.' },
    ],
  };

  const mods = divisionModernizations[patent.division] || divisionModernizations.MECH_ENG;

  thoughtLog.push({
    timestamp: new Date(),
    message: 'HEURISTIC ANALYSIS COMPLETE',
    type: 'success',
  });

  return {
    modernizations: mods,
    properties: {
      torque: '442.8 Nm',
      stress: '18.2 MPa',
      material: mods[0].material,
      expiryYear: patent.expiryYear,
    },
    thoughtLog,
    blueprintDescription: `Modernized ${patent.title} using advanced materials and manufacturing`,
  };
}

/**
 * Generate a modernized blueprint image using Gemini 2.0 Flash Image Generation
 */
export async function generateBlueprintImage(
  patent: {
    title: string;
    abstract: string;
    division: string;
    blueprintDescription?: string;
  },
  modernizations: ModernizationSuggestion[]
): Promise<{ imageBase64: string | null; description: string }> {
  const modernizationList = modernizations
    .map((m, i) => `${i + 1}. ${m.aspect}: ${m.original} -> ${m.modernized} (${m.material})`)
    .join('\n');
  const prompt = `Create a precise industrial engineering blueprint illustration for the expired patent "${patent.title}".

SOURCE CONTEXT:
${patent.abstract.slice(0, 1800)}

MODERNIZATION TARGETS:
${modernizationList}

ENGINEERING DESCRIPTION FROM THE ANALYSIS ENGINE:
${patent.blueprintDescription || `A ${patent.division} mechanism derived from the patent abstract above.`}

COMPOSITION:
- One centered exploded isometric assembly, fully inside the frame with generous margins.
- Preserve the recognizable mechanism implied by the source patent and engineering description; show the upgraded parts as a coherent, manufacturable design.
- Every visible major part must be traceable to the source context, engineering description, or modernization targets. Do not substitute a generic gear assembly, robot, vehicle, turbine, or laboratory device.
- Use a dark Prussian-blue cyanotype background, fine coordinate grid, orthographic construction lines, section marks, dimension ticks, and crisp cyan/white technical linework.
- Clearly separate 3–5 major components with restrained leader lines. Use short labels only when legible; never add paragraphs or decorative UI text.
- Include visible gears, shafts, bearings, linkages, sensors, fasteners, and structural members only when appropriate to the mechanism.

STYLE AND EXCLUSIONS:
High-contrast technical drafting, clean vector-like edges, accurate proportions, restrained annotations, no people, no hands, no logos, no product branding, no fantasy/sci-fi elements, no photorealistic render, no clutter, no illegible pseudo-text, no cropped components.`;

  try {
    const response = await fetch(OPENROUTER_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getOpenRouterApiKey()}`,
        'HTTP-Referer': 'https://github.com/AryanSaxenaa/renaissance',
        'X-Title': 'RenaissanceAI',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image',
        prompt,
        output_format: 'png',
        aspect_ratio: '16:9',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter image API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json() as { data?: Array<{ b64_json?: string }> };
    const imageBase64 = data.data?.[0]?.b64_json || null;
    if (!imageBase64) throw new Error('OpenRouter image API returned no image data');

    return {
      imageBase64,
      description: `OpenRouter image generated with ${process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image'}`,
    };
  } catch (error) {
    console.error('[OpenRouter Image] Falling back to deterministic blueprint:', error);
    return {
      imageBase64: null,
      description: `Modernized ${patent.title} featuring ${modernizations[0]?.material || 'advanced materials'}`,
    };
  }
}

/**
 * Analyze mechanical gaps in a patent and suggest modern solutions
 */
export async function analyzeMechanicalGaps(patent: {
  patentId: string;
  title: string;
  abstract: string;
  claims: string[];
}): Promise<{
  gaps: Array<{
    component: string;
    originalLimitation: string;
    modernSolution: string;
    improvementFactor: string;
  }>;
  overallAssessment: string;
}> {
  const prompt = `You are an expert mechanical engineer analyzing an expired patent for modernization opportunities.

PATENT: ${patent.patentId} - ${patent.title}
ABSTRACT: ${patent.abstract}
CLAIMS: ${patent.claims.slice(0, 4).join('\n')}

Identify the key mechanical limitations of this design from its era and suggest modern solutions.

Respond in JSON format ONLY:
{
  "gaps": [
    {
      "component": "Name of component/system with limitation",
      "originalLimitation": "What the original design couldn't achieve",
      "modernSolution": "Modern technology/material that addresses this",
      "improvementFactor": "Quantified improvement (e.g., '3x stronger', '50% lighter')"
    }
  ],
  "overallAssessment": "Brief summary of modernization potential (1-2 sentences)"
}

Identify exactly 4 mechanical gaps.`;

  try {
    const response = await callGeminiApi(prompt);

    let jsonStr = response;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const result = JSON.parse(jsonStr);
    return {
      gaps: result.gaps || [],
      overallAssessment: result.overallAssessment || 'Analysis complete',
    };
  } catch (error) {
    console.error('[Gemini AI] Mechanical gap analysis error:', error);
    return {
      gaps: [
        {
          component: 'Materials',
          originalLimitation: 'Heavy steel/iron construction',
          modernSolution: 'Titanium alloys or carbon fiber composites',
          improvementFactor: '40-60% weight reduction',
        },
        {
          component: 'Manufacturing',
          originalLimitation: 'Limited to casting/machining',
          modernSolution: 'Additive manufacturing (3D printing)',
          improvementFactor: 'Complex geometries possible',
        },
        {
          component: 'Controls',
          originalLimitation: 'Manual or mechanical controls',
          modernSolution: 'Digital sensors and IoT connectivity',
          improvementFactor: 'Real-time monitoring and automation',
        },
        {
          component: 'Efficiency',
          originalLimitation: 'Friction and wear issues',
          modernSolution: 'Ceramic bearings and advanced lubricants',
          improvementFactor: '30% efficiency improvement',
        },
      ],
      overallAssessment: 'This patent shows significant modernization potential with current materials and manufacturing technology.',
    };
  }
}
