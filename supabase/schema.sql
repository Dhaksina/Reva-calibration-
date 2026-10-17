-- =============================================================================
-- REVA PHOENIX CALIBRATION — SUPABASE DATABASE MIGRATION & SCHEMA
-- Paste this entire script into your Supabase SQL Editor and click "Run".
-- =============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLE: laboratories (35 Integrated Metrology Laboratories)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.laboratories (
    id BIGINT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    tagline TEXT,
    cmc TEXT,
    stat_cmc TEXT,
    tat TEXT,
    env_control TEXT,
    inst_count TEXT,
    scope TEXT,
    equipment TEXT,
    standards TEXT,
    parameters TEXT,
    catalog_url TEXT,
    catalog_name TEXT,
    document_data TEXT,
    document_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLE: documents (Brochures & Accreditation Certificates)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGINT PRIMARY KEY,
    meta TEXT,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    file_url TEXT NOT NULL,
    button_text TEXT DEFAULT 'Download',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TABLE: site_images (Infrastructure Gallery & Leadership Images)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_images (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sub TEXT,
    section TEXT,
    category TEXT,
    path TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLE: enquiries (Lead Inquiries & Calibration Quote Requests)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    lab_id BIGINT REFERENCES public.laboratories(id) ON DELETE SET NULL,
    service_required TEXT DEFAULT 'Calibration',
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TABLE: site_content (Dynamic Site Sections & Editorial Text)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public Read Laboratories" ON public.laboratories;
DROP POLICY IF EXISTS "Public Read Documents" ON public.documents;
DROP POLICY IF EXISTS "Public Read Site Images" ON public.site_images;
DROP POLICY IF EXISTS "Public Read Site Content" ON public.site_content;
DROP POLICY IF EXISTS "Public Insert Enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow All Laboratories Modify" ON public.laboratories;
DROP POLICY IF EXISTS "Allow All Documents Modify" ON public.documents;
DROP POLICY IF EXISTS "Allow All Site Images Modify" ON public.site_images;
DROP POLICY IF EXISTS "Allow All Site Content Modify" ON public.site_content;
DROP POLICY IF EXISTS "Allow All Enquiries Read" ON public.enquiries;

-- Public can read all active website directories & content
CREATE POLICY "Public Read Laboratories" ON public.laboratories FOR SELECT USING (true);
CREATE POLICY "Public Read Documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public Read Site Images" ON public.site_images FOR SELECT USING (true);
CREATE POLICY "Public Read Site Content" ON public.site_content FOR SELECT USING (true);

-- Public can submit customer enquiries/quotes
CREATE POLICY "Public Insert Enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Authorized operations (via anon key or service role)
CREATE POLICY "Allow All Laboratories Modify" ON public.laboratories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Documents Modify" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Site Images Modify" ON public.site_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Site Content Modify" ON public.site_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Enquiries Read" ON public.enquiries FOR SELECT USING (true);

-- -----------------------------------------------------------------------------
-- SEED INITIAL DATA (All 35 Laboratories, Documents & Media Registry)
-- -----------------------------------------------------------------------------
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (1, 'LAB-DIM-01', 'Dimension - Basic Instruments', 'dimensional', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', 'Down to ± 0.05 µm (Reference Spheres) | Calipers: ± 3.59 µm | Micrometers: ± 0.54 µm | Laser Linear: ± (0.5 + √(L/1000)) µm', '± 0.05 µm / ± (0.5 + √(L/1000)) µm', '24–48h', '20°C ± 1°C, RH 45% ± 5%, Class 100k Cleanroom', '283 NABL Scopes', 'Comprehensive NABL Scope: Calipers, Micrometers, Height Gauges, Dial Indicators, Gauges, Setting Standards, Surface Plates, Machine Tools (Linear & Positioning Accuracy up to 40,000 mm), and 2D Height Gauges.', 'Long Slip Gauges & Gauge Blocks, Length Measuring Machine (LMM), Laser Interferometer with Linear & Angular Optics, Profile Projectors, Caliper Checkers, Precision Granite Surface Plates.', 'ISO/IEC 17025:2017, IS 3651, JIS B 7507, JIS B 7502, ASME B89, DIN 5480, ISO 148, ASTM E18', 'Linear displacement, external/internal diameters, thread effective diameters, pitch, flatness, parallelism, squareness, angular deflection, transmission errors, machine tool positioning.', 'assets/images/labs/lab_1.png', 'REVA Dimension Basic Instruments Calibration Scope', 'assets/docs/Reva-Phoenix-Catalog.pdf', 'Dimension-Basic-Instruments-Catalog.pdf')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (2, 'LAB-DIM-02', 'Dimension - Precision Instruments', 'dimensional', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', 'Down to ± 0.03 µm (Gauge Blocks) | ± 0.041 µm (Optical Parallels) | Laser Linear: ± (0.05 + L/2000) µm | Angular: ± 1.85 min / 2.4 sec of arc', '± 0.03 µm', '2-4 Business Days', 'Temperature: 20°C ± 1°C, Humidity: 45% - 55% RH Cleanroom Class 10,000', '146 NABL Scopes', 'Ultra-Precision Dimensional Metrology: Gauge Block Calibrators, Slip Gauges Grade 0/1/2, Optical Flats & Parallels, 2D Linear Height Gauges, ULM & Length Measuring Machines (up to 3000 mm), Coordinate Measuring Machines (CMM up to 8000 mm), Portable Arm CMM, Laser Interferometer Linear & Angular Systems, Profile Projectors, Video Measuring Machines (VMM), Tool Makers Microscopes, Floating Carriage Diameter Measuring Machines, Sine Bars & Centers, Surface Roughness Testers & Specimens, Dial Calibration Testers, Electronic Levels, and Setting Masters.', 'Laser Interferometer with Linear & Angular Optics, Universal Length Measuring Machine (ULM), Length Measuring Machine (LMM), Gauge Block Calibration Tester & Grade ''K'' Master Sets, Optical Flats & Monochromatic Light Source, Check Masters, Cylindrical Squares, Granite L-Squares, Stage Micrometers, Roughness Specimens & Depth Masters, Electronic Comparator LVDT Probes.', 'ISO/IEC 17025:2017, ISO 3650, ISO 10360 series, JIS B 7184, JIS B 7510, ASTM E10, ISO 6506-2, EURAMET cg-2, MOY/SCMI/9, ASME B89', 'Central length deviation, flatness, parallelism, squareness, straightness, concentricity, diameter, runout, pitch & yaw, angular deflection, 2D/3D magnification, surface roughness (Ra, Ry, Rz), linear travel, volumetric accuracy.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (3, ('LAB-CNC-03', 'CNC Machine Calibration', 'mechanical', 'Laser Interferometer Linear Positioning Accuracy (up to 40,000 mm), Pitch & Yaw Angular Deviation (up to 1.5°), and Rotary Indexing Accuracy (0° to 360°).', true, true, 'gear', 'Laser Measuring System with Linear Optics, Rotary Indexer, Angular Pitch & Yaw Optics, Environmental Sensors.', 'Linear axis positioning accuracy & repeatability, pitch & yaw angular deviations, rotary table positioning & indexing accuracy.', 'Linear: ± (0.5 + SQRT(L/1000)) µm | Pitch & Yaw: ± 2.4 arcsec | Indexing: ± 2.8 arcsec.', 'ISO 230-2, ISO 230-1, ASME B5.54, VDI/DGQ 3441, ISO/IEC 17025:2017.', 'CNC Vertical/Horizontal Machining Centers (VMC/HMC), CNC Lathes, 5-Axis Gantry Milling Machines, Boring Mills, Rotary Indexing Tables.', '± 2.4 arcsec / (0.5 + √(L/1000)) µm', '3 NABL Scopes', 'assets/images/labs/lab_3.png', 'REVA CNC Machine Tool Calibration Laboratory accredited under ISO/IEC 17025:2017 with unbroken traceability to NPL/NIST standards.');
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (4, 'LAB-MAS-04', 'Mass - Weights & Balance', 'dimensional', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', 'Weights: from ± 0.001 mg (Class E1) | Balances: from ± 0.002 mg (Class I) up to 4000 kg.', '± 0.001 mg / 0.002 mg', '3-5 Days', 'Class 10,000 Cleanroom Environment, 20°C ± 0.5°C, Barometric Pressure & Humidity Compensated', '45 NABL Scopes', 'Standard Weights (Class E1, E2, F1, F2, M1) & Electronic Balances / Weighing Scales (Class I, II, III, IIII, IV) up to 4000 kg, and Spring Balances.', 'Class E1, E2, F1, F2, M1 Standard Weights, Electronic Micro Balances (1 µg & 0.01 mg readability), Electronic Precision Balances, Differential Newton Weights.', 'OIML R 76-1, OIML R 111-1, IS 16514-1:2024, ISO/IEC 17025:2017', 'Conventional mass value, magnetic susceptibility, balance linearity, corner load error (eccentricity), repeatability, Tare error.', 'assets/images/labs/lab_4.png', 'REVA Mass Calibration Scope (Weights & Balances)')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (5, 'LAB-VOL-05', 'Volume', 'dimensional', NULL, 'Expanded Uncertainty: ± 0.025 µl to ± 5.8 ml (0.1 µl to 5000 ml).', '± 0.025 µl', NULL, NULL, '30 NABL Scopes', 'Burettes, Pycnometers, Separating Funnels, Measuring Cylinders, Graduated Jars, Density Bottles, Centrifuge Tubes, Micropipettes, Piston Pipettes, Single/Graduated Pipettes, Dispensers, Volumetric Flasks, Le Chatelier Flasks, Standard Flasks, Conical Flasks, Beakers & Specific Gravity Bottles.', 'Electronic Micro Balance (Readability: 0.001 mg), Electronic Semi Micro Balance (Readability: 0.01 mg), Electronic Precision Weighing Balances (Readability: 1 mg & 100 mg), Degassed ASTM Type 1 Deionized Water System.', 'ISO 4787:2021, ISO 8655-6:2022, ISO 3507:1999.', 'Gravimetric dispensed and containment volume, deliverable capacity, systematic error (inaccuracy), random error as per ISO 4787:2021, ISO 8655-6:2022 & ISO 3507:1999.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (6, 'LAB-DEN-06', 'Density - Viscosity', 'fluid', NULL, 'Density: ± 0.00004 g/ml | Solid Density: ± 0.0031 g/ml | Flow Cups: ± 0.12% to 0.17% | Dynamic Viscosity: ± 0.5%.', '± 0.00004 g/ml', NULL, NULL, '15 NABL Scopes', 'Alcoholometers, Baume Hydrometers, Brix Hydrometers, Density of Liquid, Density of Solid, Viscosity Flow Cups (Ford, DIN, ISO, Zahn, etc.), Lactometers, Sikes Hydrometers, Specific Gravity Hydrometers, Butyrometers, Twaddle Hydrometers, Dynamic Viscometers (Rotational, Krebs, Paddle, Brookfield).', 'Standard Hydrometers, Semi Micro Balance 220 g (Readability: 0.01 mg), Calibrated Pycnometers, Density Determination Kit (Archimedes Principle), Hydrostatic Weighing Setup (Cuckow Method), Standard Viscosity Solutions, Calibrated Newtonian Liquids.', 'IS 3608, IS 1255, IS 7324, IS 4730, IS 3944, ASTM D1200, ISO 2555, ISO 1652, OIML G14.', 'Liquid density, solid density, specific gravity, efflux cup kinematic viscosity, dynamic rotational viscosity, Brix/Baume/Twaddle/Alcohol/Sikes scales as per IS 3608, IS 1255, IS 7324, IS 4730, IS 3944, ASTM D1200, ISO 2555, ISO 1652, OIML G14.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (7, 'LAB-MEC-07', 'Mechanical - UTM - TTM - CTM', 'mechanical', NULL, 'UTM Force: ± 0.3% to ± 0.5% | Displacement: ± 0.06 mm to ± 0.16 mm | Speed: ± 0.8 mm/min.', '± 0.3% / 0.06 mm', NULL, NULL, '07 NABL Scopes', 'Uniaxial Static Testing Machines (UTM / CTM / TTM), Creep, Spring, Flexural Testers, Crosshead Displacement & Speed.', 'Class 0.5 Master Load Cell with Digital Indicator, Linear Scale with Digital Readout (DRO), Digital Stop Watch.', 'IS 1828 (Part 1):2022, ISO 7500-1:2018, JIS B 7221-2010, ASTM E4, ISO 9513:2012, ASTM E2309-20, ASTM E2658-23.', 'Compression mode (100 N to 1000 kN), Tension mode (100 N to 1000 kN), Crosshead displacement (0 to 1000 mm), Crosshead speed (1.5 to 1000 mm/min).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (8, (('LAB-FOR-08', 'Mobile Force - Push-pull', 'mechanical', 'Push Pull Gauges, Digital & Analog Force Gauges, Tension Gauges (Up to 2000 N).', true, true, 'activity', 'Differential Denominations of Newton Weights as per VDI/VDE 2624 Part 2.1.', 'Tension & Compression force verification using direct Newton deadweights.', 'Up to 500 N: ± 0.5 N | > 500 N to 2000 N: ± 3.06 N.', 'VDI/VDE 2624 Part 2.1, ISO/IEC 17025:2017.', 'Terminal wire crimp testing, packaging seal peel strength, spring rate verification, automotive assembly lines, component push/pull testing.', '± 0.5 N / 3.06 N', '2 NABL Scopes', 'assets/images/labs/lab_8.png', 'REVA Mobile Force - Push-Pull Calibration Laboratory accredited under ISO/IEC 17025:2017 with unbroken traceability to NPL/NIST standards.');
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (9, 'LAB-HAR-09', 'Verification of Hardness Test M/c', 'mechanical', NULL, 'Brinell: ± 1.35% | Rockwell: ± 0.53 HR | Vickers: ± 1.65% | Micro Vickers: ± 2.65% | Leeb: ± 7.7 HLD.', '± 0.53 HR / 1.35%', NULL, NULL, '22 NABL Scopes', 'Brinell, Rockwell, Vickers, Micro-Vickers & Leeb Hardness Testing Machines.', 'Standard Hardness Test Blocks, Direct Verification Loadcells, Certified Indenters & Optical Systems.', 'IS 1500-2:2021, IS 1586-2:2018, IS 1501-2:2020, ISO 6506-2:2017, ISO 6508-2:2023, ISO 6507-2:2018, ASTM E10-23, ASTM E18-22, ASTM E384-22, ASTM A956.', 'Indirect verification using Standard Hardness Test Blocks as per IS 1500-2:2021, IS 1586-2:2018, IS 1501-2:2020, ASTM E10-23, ASTM E18-22, ASTM E384-22, ASTM A956.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (10, 'LAB-TRQ-10', 'Torque - Measuring Device, Sensor', 'mechanical', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', '0.05 Nm to 200 Nm: ± 0.12% | 200 Nm to 3000 Nm: ± 0.15%', '± 0.12%', '2-4 Business Days', 'Temperature: 23°C ± 2°C, Humidity: 40% - 60% RH', '2 NABL Scopes (10 Instrument Variants)', 'High-Precision Torque Calibration: Torque Sensors with Indicator / Calibrator, Torque Transducers with / without Indicator, Torque Meters, Rotary / Impact / Torque Gauges, and Torque Testers from 0.05 Nm to 3000 Nm.', 'Dead Weight Torque Calibration System of Lever Arm, Aluminium & Stainless Steel (SS) Dead Weights as per BS 7882.', 'BS 7882, ISO/IEC 17025:2017, DIN 51309, EURAMET cg-14, IS/ISO 6789', 'Clockwise & counter-clockwise torque, calibration sensitivity, linearity, hysteresis, zero return, repeatability, deflection under dead weight load.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (11, 'LAB-TRQ-11', 'Torque - Generating Device, Wrench', 'mechanical', NULL, 'Expanded Uncertainty: ± 0.14% to ± 1.46% of reading (0.01 Nm to 1,00,000 kNm).', '± 0.14% rdg', NULL, NULL, '10 NABL Scopes', 'Torque Wrench, Torque Screw Driver, Torque Spanner, Torque Gauge (Type I & II), Hydraulic Torque Wrench, Electric Torque Wrench, Pneumatic Torque Wrench, Impact Torque Tool, Rotary Torque Tool, Torque Controlled DC Nut Runner.', 'Torque Transducer with Indicator, Torque Wrench Tester, Hydraulic Torque Wrench Calibrator with Torque Sensor & Digital Indicator, Torque Calibration System.', 'ISO 6789-1:2017, ISO 6789-2:2017, ISO 5393:2017, ISO/TS 17104:2006.', 'Using Torque Transducer with Indicator, Torque Wrench Tester, Hydraulic Calibrator, and Torque Calibration System by Comparison Method as per ISO 6789-1:2017, ISO 6789-2:2017, ISO 5393:2017 & ISO/TS 17104:2006.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (12, 'LAB-PRS-12', 'Pressure - Vacuum - Acoustics', 'pressure', NULL, 'Sound Level Meter: ± 0.58 dB (94 dB & 114 dB @ 1 kHz, Weighting A & C).', '± 0.58 dB', NULL, NULL, '2 NABL Scopes', 'Sound Level Meter @ 1 kHz (Weighting A & C) Acoustic Calibration.', 'Class 1 Sound Level Calibrator, Reference Acoustic Standard.', 'IS 15575-2, OIML R 58, IEC 61672-1, IEC 60942, ISO/IEC 17025.', 'Sound pressure levels (94 dB & 114 dB @ 1 kHz), frequency weighting (A & C) direct comparison as per IS 15575-2 & OIML R58.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (13, 'LAB-PRS-13', 'Pressure Balance - Dead Weight Tester', 'pressure', NULL, 'Vacuum DWT: ± 0.0077% rdg (-1 to -0.03 bar) | Pneumatic DWT: ± 0.0074% rdg (0.2 to 35 bar) | Hydraulic DWT: ± 0.0095% to 0.010% rdg (1 to 1400 bar).', '± 0.0074% rdg', NULL, NULL, '6 NABL Scopes', 'Vacuum Dead Weight Tester (Pneumatic - Vacuum), Pneumatic Dead Weight Tester (Pneumatic - Pressure) & Hydraulic Dead Weight Tester (Hydraulic - Pressure) Primary / Reference Standards.', 'Reference Dead Weight Testers, Controlled-Clearance Piston-Cylinder Assemblies, Cross-Floating Metrology System, Local Gravity Determination.', 'EURAMET cg-3, OIML R 110, ISO/IEC 17025:2017.', 'Effective cross-sectional area of piston-cylinder assembly (A₀), pressure distortion coefficient (b), mass values, float time/sink rate, rotational decay, gas/oil buoyancy correction as per EURAMET cg-3 & OIML R 110.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (14, 'LAB-PRS-14', 'Pressure Indicating Devices', 'pressure', NULL, 'Hydraulic DWT: ± 0.010% to 0.021% rdg (1 to 1379 bar) | Pneumatic DWT: ± 0.01% rdg (200 mbar to 35 bar) | Hydraulic: ± 0.025 bar to 1.1 bar (up to 4000 bar) | Pneumatic: ± 0.0006 bar to 0.006 bar | Low Pressure: ± 0.017 to 0.0672 mbar | Absolute: ± 0.00042 bar (abs) | Vacuum: ± 0.12 to 0.2 mbar.', '± 0.01% rdg / 0.00042 bar', NULL, NULL, '39 NABL Scopes', 'Analog / Digital Pressure Gauges, Calibrators, Indicators, Controllers, Recorders, Data Loggers, Modules, Transmitters, Transducers, Switches, Manometers, Magnehelic Gauges, Liquid Column Manometers, Barometers, Absolute Pressure Gauges & Vacuum Gauges.', 'Hydraulic Dead Weight Tester, Pneumatic Dead Weight Tester, Digital Pressure Calibrators, Hydraulic & Pneumatic Comparator Pumps, Low Pressure Comparator Pumps, Absolute Pressure Standards, Digital Manometers.', 'DKD-R 6-1, OIML R 97, OIML R 110, EN 837-1, ASME B40.100, IS 3624, ISO/IEC 17025.', 'Hydraulic pressure (up to 4000 bar), Pneumatic pressure (up to 40 bar), Low / differential pressure (0 to 500 mbar), Absolute pressure (0.015 to 4 bar abs), Vacuum down to (-) 1000 mbar as per DKD-R 6-1 & OIML R 97.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (15, 'LAB-IMP-15', 'Verification of Impact Test M/c', 'mechanical', NULL, 'Charpy: ± 0.95% (0 to 300 J) | Izod: ± 0.6% (0 to 168 J).', '± 0.6% / 0.95%', NULL, NULL, '02 NABL Scopes', 'Impact Testing Machine - Charpy (0 to 300 J) & Impact Testing Machine - Izod (0 to 168 J) Direct and Indirect Verification.', 'Impact Calibration Kit, Standard Reference Test Pieces.', 'ISO 148-2:2016, ASTM-E23-23, BS 131-4:2020.', 'Using Impact Calibration kit and Standard Reference Test Pieces by Direct and Indirect Verification as per ISO 148-2:2016, ASTM-E23-23, BS 131-4:2020.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (16, 'LAB-DUR-16', 'Durometer - Rubber Hardness', 'mechanical', NULL, 'Durometer: ± 0.3 Shore | Depth: ± 1.02 µm | Leeb: ± 7.7 HLD | Brinell: ± 1.35% | Rockwell: ± 0.53 HR | Vickers: ± 1.65%.', '± 0.3 Shore', NULL, NULL, '26 NABL Scopes', 'Rubber / Shore Hardness Tester (Durometer) - Scales A, B, C, D, DO, E, O, OO, OOO, OOOS, AM, AO, DO, C1L, Depth Indentation & Hardness Testing Machines.', 'Laser Measuring Machine (LMM), Electronic Comparator, Loadcell with Indicator, Standard Hardness Test Blocks.', 'ASTM D2240, ASTM A956, IS 1500 : Part 2 : 2021, IS 1586 : Part 2 : 2018, IS 1501 : Part 2 : 2020, ISO 6506-2, ISO 6508-2, ISO 6507-2.', 'Using LMM & Electronic Comparator by Depth Indentation Method as per ASTM D 2240, Loadcell with Indicator by Spring Force Method as per ASTM D2240, and Standard Hardness Test Blocks as per ASTM A956, IS 1500, IS 1586, IS 1501.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (17, 'LAB-FLW-17', 'Fluid Flow - Liquid', 'fluid', NULL, 'Expanded Uncertainty: ± 1.2% of reading (0.20 m³/hr to 1090 m³/hr).', '± 1.2% rdg', NULL, NULL, '02 NABL Scopes', 'Digital & Analog Water Flow Meters, Rotameters, Electromagnetic Flow Meters, Ultrasonic Flow Calibrators, Flow Transducers & Transmitters.', 'Magnetic Flow Meter, Ultrasonic Clamp on Liquid Flow Meter, 6½ Digit Multimeter.', 'ISO 4064, ISO 9104, BS EN 29104, ISO 12242.', 'Comparison Method using Magnetic Flow Meter & 6½ Digit Multimeter (Permanent: 2.5 m³/hr to 250 m³/hr) and Ultrasonic Clamp-on Flow Meter & 6½ Digit Multimeter (Site: 0.20 m³/hr to 1090 m³/hr) for liquid media.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (18, 'LAB-FLW-18', 'Fluid Flow - Gas', 'fluid', NULL, 'Expanded Uncertainty: ± 0.9% to ± 1.5% of reading (1 ccm to 500 lpm).', '± 0.9% rdg', NULL, NULL, '06 NABL Scopes', 'Analog / Digital - Gas Flow Meter, Mass Flow Controller, Mass Flow Meter, Rotameter, Orifice Flow Meter, Dry Gas Meter, Flow Calibrator (Medium - Air / Gas).', 'Laminar Gas Flow Calibrator, Orifice Flow Calibrator.', 'ISO 5167, ISO 9300, EURAMET cg-19, SEMI E12.', 'Using Laminar Gas Flow Calibrator & Orifice Flow Calibrator by Comparison Method as per standard flow calibration procedures for Air and Gas media.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (19, 'LAB-AIR-19', 'Fluid Flow - Air - Flow Velocity', 'fluid', NULL, 'Expanded Uncertainty: ± 4.5% of reading (0.22 m/s to 30 m/s).', '± 4.5% rdg', NULL, NULL, '04 NABL Scopes', 'Anemometer, Air Velocity Sensor, Air Velocity Meter with Pen Type Sensor, Hot Wire Anemometer, Velocity Transmitter, Velocity Meter, Pitot Tube (Hot Wire / Vane Type).', 'Digital Anemometer & Wind Tunnel System.', 'ISO 16622, EN 60584, EPA Method 2.', 'Using Digital Anemometer & Wind Tunnel by Comparison Method across 0.22 m/s to 30 m/s for Air Velocity measurement.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (20, ('LAB-ELE-20', 'Electro Technical - AC - DC', 'electrical', 'Digital Multimeters (up to 8.5 digits), Multifunction Calibrators, AC/DC Voltage & Current, LCR, Power & Energy, High Voltage, Oscilloscopes, and Temperature Simulation.', true, true, 'zap', '8½ & 6½ Digit Multimeters, Multi Product Calibrator with 50-Turn Current Coil, High Voltage Probe, LCR Meter, 3Ø Energy Calibration Source, Decade Boxes, Reference Gauss Meter.', 'AC/DC Voltage (up to 40 kV), AC/DC Current (up to 1000 A), AC/DC Power & Energy, Resistance (10 µΩ to 1000 GΩ), Capacitance (10 pF to 109 µF), Inductance (100 µH to 10 H), Frequency (1 Hz to 2 MHz), Time, Oscilloscopes, and RTD/TC Simulation.', 'DCV: ± 0.00062% | ACV: ± 0.02% | DCI: ± 0.003% | ACI: ± 0.058% | Res: ± 0.001% | Temp Sim: ± 0.015°C | Freq: ± 0.0003% | Time: ± 0.011 s.', 'ISO/IEC 17025:2017, EURAMET cg-15, IEEE 1241, IS 1248, IEC 60051.', 'Electronics manufacturing, power utilities & substations, defense avionics, renewable energy inverters, precision calibration laboratories, pharmaceutical instrumentation, high-voltage test setups.', '± 0.00062% / 0.015°C', '312 NABL Scopes', 'assets/images/labs/lab_20.png', 'REVA Electro Technical Calibration Laboratory accredited under ISO/IEC 17025:2017 for Permanent and Site facility.');
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (21, 'LAB-RFM-21', 'RF - Microwave', 'electrical', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', 'Bandwidth (up to 1.1 GHz): ± 6 % | Time Base (1 ns to 5 s): ± 0.03 % to 0.58 % | AC/DC Vertical Deflection: ± 0.06 % to 4.73 %', '± 0.03 % to 0.58 % (Time Base) | 6 % (1.1 GHz Bandwidth)', '3-5 Days', 'Class 100,000 Environment, 23°C ± 1°C, RF Shielded Facility', '10 NABL Scopes', 'Digital Storage Oscilloscopes (DSO), Mixed Signal Oscilloscopes (MSO) & Sampling Scopes up to 1.1 GHz Bandwidth, Time Base (1 ns to 5 s), and Vertical AC/DC Deflection.', 'Multi Product Calibrator with High-Frequency Oscilloscope Calibration Option / Leveled Sine Wave Generator.', 'IEEE 1057, EURAMET cg-20, ISO/IEC 17025:2017', 'RF bandwidth (@ 50 kHz to 1.1 GHz), horizontal time base (1 ns to 5 s), vertical deflection factor (AC Sine & Square wave 1 kHz, DC amplitude 1 mV to 130 V @ 1 MΩ).', 'assets/images/labs/lab_21.png', 'REVA RF & Microwave Oscilloscope Calibration Scope')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (22, 'LAB-TIM-22', 'Time - Frequency', 'electrical', NULL, 'Frequency Measure: ± 0.058% to 0.012% (3 Hz to 1 MHz) | Frequency Source: ± 0.0003% to 0.001% (1 Hz to 2 MHz) | Time Interval: ± 0.011 s to 1.51 s (0.1 s to 86400 s).', '± 0.0003% / 0.011 s', NULL, NULL, '22 NABL Scopes', 'Time & Frequency Measurement (3 Hz to 1 MHz & 0.1 s to 86400 s) and Frequency Generation / Sourcing (1 Hz to 2 MHz).', '6½ Digit Multimeter, Multi Product Calibrator, Time Interval Meter, Time Totalizer, Precision Frequency Standard.', 'ISO/IEC 17025:2017, IEEE 1131, NIST SP 250-91.', 'Frequency Measurement (3 Hz to 1 MHz), Frequency Sourcing (1 Hz to 2 MHz), Time Interval Measurement (0.1 s to 86400 s / 24 hours).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (23, 'LAB-EMC-23', 'EMI - EMC', 'electrical', NULL, 'Voltage/Current pulses: ± 2.5% | Rise time: ± 5%.', NULL, NULL, NULL, NULL, 'EMC Test Receivers, LISN, Surge/Burst Generators, ESD Simulators & RF Field Probes.', 'High-Voltage Waveform Oscilloscopes, High-Power Attenuators, Current Probes, Calibrated ESD Target.', 'IEC 61000-4-2 (ESD), IEC 61000-4-4 (EFT), IEC 61000-4-5 (Surge), CISPR 16-1-1.', 'EFT/Burst pulse waveform shape, surge open-circuit voltage & short-circuit current, ESD discharge pulse parameters, LISN impedance.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (24, 'LAB-EGC-24', 'Energy - Gauss - pH - Conductivity', 'electrical', 'NABL Accredited ISO/IEC 17025:2017 • Unbroken Traceability to NPL & NIST', 'Energy: ± 0.16 % to 0.21 % | Gauss: ± 6.6 % | pH: ± 0.057 % | Conductivity: ± 1.61 % to 7.86 %', '± 0.16 % to 0.21 % (Energy) | 6.6 % (Gauss)', '3-5 Days', 'Class 100,000 Environment, 25°C ± 2°C, Shielded Low-Noise Electrical Metrology Lab', '39 NABL Scopes', '1-Phase & 3-Phase Energy Meters, Active Power, Power Factor, Phase Angle, Gauss Meters (Magnetic Flux), pH Meters, and Conductivity Meters.', '3Ø Energy Calibration Source, Multi Product Calibrator, Reference Gauss Meter & Standard Reference Magnets, Decade Resistance Box & Decade Megohm Box.', 'IEC 62053, IS 13779, IS 14697, OIML R 46, ASTM D1125, ISO/IEC 17025:2017', 'AC Active Energy, AC Active Power, AC Power Factor, Phase Angle, Magnetic Flux Density (Gauss), pH Potential (mV), Electrical Conductivity / Resistance.', 'assets/images/labs/lab_24.png', 'REVA Energy, Gauss, pH & Conductivity Calibration Scope')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (25, 'LAB-TRH-25', 'Temperature & Relative Humidity', 'thermal', NULL, 'Temperature: ± 0.04°C to 0.14°C (-196°C to 650°C) | High Temp: ± 1.5°C to 3.2°C (600°C to 1500°C) | Humidity: ± 1.27% to 1.6% RH (10% to 95% RH) | Dew Point: ± 0.78°C to 0.85°C (-20°C to 20°C).', '± 0.04°C / 1.27% RH', NULL, NULL, '269 NABL Scopes', 'Contact Temperature (-196°C to 1500°C), Relative Humidity (10% to 95% RH), Dew Point (-20°C to 20°C), and Thermal & Environmental Chambers (Single & Multi-Position).', 'Standard Platinum Resistance Thermometer (SSPRT), S-Type & R-Type Thermocouples with Indicators, PRT Probes, 6½ Digit Multimeters, Precision Liquid Baths, Dry Block Calibrators, Liquid Nitrogen LN2 Apparatus, Humidity Chambers & Dew Point Meters.', 'ITS-90, ASTM E220, ASTM E77, IEC 60751, IEC 60068-3-5, EURAMET cg-8, ISO/IEC 17025:2017.', 'Cryogenic to ultra-high temperature (-196°C to 1500°C), Relative Humidity (10% to 95% RH @ 10°C to 60°C), Dew point (-20°C to 20°C), Multi-point and single-position chamber profiling.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (26, 'LAB-THM-26', 'Thermal - Contact - Non-Contact', 'thermal', NULL, 'Non-Contact Temperature: ± 1.55°C to 4.12°C (-20°C to 1700°C) | Black Body Source / Cavity: ± 1.8°C to 4.12°C (-20°C to 1700°C) | Contact Dry Block Bath: ± 1.56°C to 2.1°C (650°C to 1500°C).', '± 1.55°C / 1.56°C', NULL, NULL, '76 NABL Scopes', 'Infrared Thermometers, Non-Contact Thermometers, Pyrometers, Thermal Imaging Cameras (-20°C to 1700°C), Black Body Sources & Cavities (-20°C to 1700°C), and Contact Dry Block Calibrators / Temperature Baths (650°C to 1500°C).', 'Black Body Sources, Spherical Cavity Black Body Furnaces, Standard Optical Transfer Pyrometers, Reference IR Thermometers, S-Type Master Thermocouple with Digital Indicator.', 'ASTM E2847, ASTM E1862, IEC TS 62492, VDI/VDE 3511, EURAMET cg-20, ASTM E220, ISO/IEC 17025:2017.', 'Radiation temperature, effective emissivity (0.95 & 0.99), cavity uniformity, field of view D:S ratio, thermal imaging camera calibration, dry block comparison (650°C to 1500°C).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (27, 'LAB-MAP-27', 'Thermal Mapping', 'thermal', NULL, 'RTD Multi-Channel Mapping: ± 0.82°C (-80°C to 400°C) | N-Type Multi-Channel Mapping: ± 2.7°C (400°C to 1200°C) & ± 3.4°C (1200°C to 1300°C).', '± 0.82°C / 2.7°C', NULL, NULL, '24 NABL Scopes', 'Multi-Position Thermal Mapping (Minimum 9 Sensors) for Autoclaves, Hot Air Ovens, Furnaces, Incubators, BOD Incubators, Freezers, Cold Rooms, Baths, Thermal Chambers & Temperature Calibrators (-80°C to 1300°C).', 'RTD Sensors with Multi-Channel Recorder, N-Type Thermocouples with Multi-Channel Recorder, Multi-Position Data Acquisition System.', 'AMS 2750G, CQI-9, IS 14150, EN 285, WHO TRS 961, ISO/IEC 17025:2017.', 'Multi-position thermal profiling (min 9 sensors), spatial uniformity, temperature stability, hot & cold spot analysis as per AMS 2750, CQI-9 & IS 14150 (-80°C to 1300°C).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (28, 'LAB-OPT-28', 'Optical - Photometry - Radiometry', 'thermal', NULL, 'Illuminance: ± 2.55% to 2.7% | Luminous Intensity: ± 1.82% | Luminance: ± 2.55% to 2.70% | Gloss: ± 0.6 GU to 18.5 GU | UV Radiometer: ± 2.85% to 2.9% | UV Lamps: ± 2.90% | Flux: ± 3.2%.', '± 1.82% / 0.6 GU', NULL, NULL, '36 NABL Scopes', 'Illuminance (Lux) Meters, Luminance Meters, Luminous Intensity & Flux, Specular Gloss Meters & Tiles (20°, 60°, 85°), UV Radiometers (UVA, UVB, UVC) & UV Lamps/LEDs.', 'V-Lambda & Cosine Corrected Photometer, Standard Lamp, Standard Luminous Intensity Lamp, Reference Gloss Standard & Gloss Meter, Standard UV Detector, Radiometer, UV Filters (UVA, UVB, UVC), Picoammeter, DC Power Supply.', 'CIE Publication 69, ISO/CIE 19476, ASTM D23-08, ISO 2813, ASTM E2297, DIN 5032.', 'Detector-based Photometry, Direct & Comparison Methods, Specular Gloss as per ASTM D23-08 & ISO 2813, UV Irradiance, Wavelength Bandpass Photometry & Radiometry.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (29, 'LAB-VIB-29', 'Acceleration - Speed - Vibration', 'mechanical', NULL, 'Speed / Tachometer: ± 0.3 RPM to 3.42 RPM (6 to 99999 RPM) | Vibration Displacement & Velocity: ± 2.4% to 2.5% | Vibration Acceleration: ± 2.5% (10 Hz to 1280 Hz).', '± 0.3 RPM / 2.4%', NULL, NULL, '38 NABL Scopes', 'Centrifuges, RPM Sources, Mixers, Stroboscopes, Tachometers (Contact & Non-Contact: 6 to 99999 RPM), Vibration Machines, Shakers, Portable Calibrators & Vibration Meters/Sensors (Displacement, Velocity, Acceleration @ 10 Hz to 1280 Hz).', 'Digital Tachometer, Master RPM Source, Accelerometer with Signal Analyser, Precision Multimeter, Vibration Calibration Reference System.', 'ISO 16063-21, ISO 16063-11, ISO 2954, ISO 10816, BS 4675, JIS B 0907.', 'Rotational speed (RPM) contact/non-contact comparison, Vibration acceleration (0.5 to 199.9 m/s²), velocity (0.5 to 199.9 mm/s), displacement (0.014 to 1.999 mm) as per ISO 16063.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (30, 'LAB-BIO-30', 'Biomedical', 'specialized', NULL, 'Energy: ± 1.0% | Electrical safety leakage: ± 1.0% | Flow rate: ± 1.0%.', NULL, NULL, NULL, NULL, 'Defibrillator Analyzers, Patient Simulators, Electrosurgical Analyzers & Infusion Pump Testers.', 'Fluke Biomedical Electrical Safety Analyzers, Multi-Parameter Patient Simulators (ECG/Respiration/NIBP/SpO2), Calibrated Precision Energy Loads.', 'IEC 60601-1, IEC 62353, AAMI/ANSI standards.', 'Delivered defibrillation energy (Joules), leakage current, NIBP pressure simulation, infusion flow rate & occlusion pressure.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (31, 'LAB-GAS-31', 'Gas Analyzer - Particle Counter', 'specialized', NULL, 'Particle counting efficiency: ± 5% | Gas concentration: ± 1.5% of span.', NULL, NULL, NULL, NULL, 'Airborne Optical Particle Counters, Flue Gas Analyzers, Toxic Gas Detectors & Emission Monitoring.', 'Certified NIST-Traceable Polystyrene Latex (PSL) Spheres, Precision Aerosol Generator, Certified Multi-Component Span Gas Cylinders.', 'ISO 21501-4 (Light scattering airborne particle counters), EPA standards.', 'Particle counting efficiency (0.3 µm, 0.5 µm, 1.0 µm, 5.0 µm), flow rate sampling accuracy, gas concentration (CO, CO2, NOx, SO2, O2, H2S).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (32, 'LAB-INS-32', 'Inspection Services', 'specialized', NULL, 'Volumetric Single-Point Articulated Arm: ± 0.025 mm.', NULL, NULL, NULL, NULL, 'Third Party Inspection (TPI), Dimensional Layout Inspection, Visual Inspection & First Article Inspection (FAI).', 'Portable CMM Coordinate Measuring Arms (Faro/Hexagon), 3D Laser Optical Scanners, Ultrasonic Gauges, Precision Height Masters.', 'ASME Y14.5M (GD&T), AS9102 (First Article Inspection), ISO 9001:2015.', 'Geometric Dimensioning & Tolerancing (GD&T), surface profile, location, runout, CAD-to-part inspection deviations.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (33, 'LAB-CLN-33', 'Clean Room Validation - OT - HVAC', 'specialized', NULL, 'Filter leak detection to 0.005% | Pressure differential to ± 0.5 Pa.', NULL, NULL, NULL, NULL, 'ISO 14644 Compliance, HEPA Filter Integrity (DOP), Airflow Velocity, Pressure Differentials & Recovery Tests.', 'ATI Photometer & Laskin Nozzle Aerosol Generator (PAO/DOP), Airborne Laser Particle Counters, Precision Digital Micromanometers, Balometer Airflow Hoods.', 'ISO 14644-1/2/3, EU GMP Annex 1, US FDA cGMP, Schedule M.', 'HEPA filter penetration (< 0.01%), room air changes per hour (ACPH), differential pressure cascades, non-viable airborne particle classification.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (34, 'LAB-NDT-34', 'NDT Equipment', 'specialized', NULL, 'Linearity: ± 1.0% | Velocity: ± 5 m/s | Thickness: ± 0.01 mm.', NULL, NULL, NULL, NULL, 'Ultrasonic Flaw Detectors, Thickness Gauges, Magnetic Particle Yokes, UV Lamps & Eddy Current Meters.', 'IIW V1 & V2 Calibration Blocks, Step Blocks (1 mm to 50 mm), Calibrated Gaussmeters, Calibrated Digital Radiometer Photometers, Artificial Defect Specimens.', 'ASME Sec V, EN 12668-1, ASTM E1444, ASTM E1417.', 'Time base linearity, vertical linearity, amplifier gain accuracy, magnetic field lifting power (min 4.5 kg AC / 18 kg DC), UV-A intensity (min 1000 µW/cm²).', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.laboratories (id, code, name, category, tagline, cmc, stat_cmc, tat, env_control, inst_count, scope, equipment, standards, parameters, catalog_url, catalog_name, document_data, document_name)
VALUES (35, 'LAB-SPC-35', 'Other Specialized Scope', 'specialized', NULL, 'Tailored to customer specifications compliant with ISO/IEC 17025.', NULL, NULL, NULL, NULL, 'Custom Metrology Engineering, Bespoke Fixture Validation, Specialized Sensor Calibrations & High-Capacity Standards.', 'Multi-Axis Specialized Calibration Fixtures, Custom Environmental Chambers, High-Precision Multi-Signal Loggers.', 'ISO/IEC 17025:2017, Customer Specific Requirements (CSR), API Q1.', 'Custom electrical/mechanical transfer functions, cross-axis sensitivity, thermal coefficient of expansion, bespoke test protocols.', NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code, name = EXCLUDED.name, category = EXCLUDED.category,
  tagline = EXCLUDED.tagline, cmc = EXCLUDED.cmc, stat_cmc = EXCLUDED.stat_cmc,
  tat = EXCLUDED.tat, env_control = EXCLUDED.env_control, inst_count = EXCLUDED.inst_count,
  scope = EXCLUDED.scope, equipment = EXCLUDED.equipment, standards = EXCLUDED.standards,
  parameters = EXCLUDED.parameters, catalog_url = EXCLUDED.catalog_url,
  catalog_name = EXCLUDED.catalog_name, updated_at = NOW();
INSERT INTO public.documents (id, meta, title, category, description, file_url, button_text)
VALUES (1, 'DOCUMENT: RPEC-CORP-BROCHURE // PDF', 'Reva Phoenix Corporate Brochure', NULL, 'Comprehensive overview of Reva Phoenix Labs & Consultants Pvt. Ltd., consulting methodologies, API auditing credentials, training courses, and consulting division scope.', 'assets/docs/Reva-Phoenix-Corporate-Brochure.pdf', 'Download')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description,
  file_url = EXCLUDED.file_url, updated_at = NOW();
INSERT INTO public.documents (id, meta, title, category, description, file_url, button_text)
VALUES (2, 'CERTIFICATION: ISO 9001:2015 // PDF', 'ISO 9001 Quality Certificate', NULL, 'Official Quality Management System Certificate verifying Reva Phoenix Labs & Consultants adherence to international QMS benchmarks.', 'assets/docs/Reva-Phoenix-ISO-9001-Certificate.pdf', 'Download')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description,
  file_url = EXCLUDED.file_url, updated_at = NOW();
INSERT INTO public.documents (id, meta, title, category, description, file_url, button_text)
VALUES (3, 'ACCREDITATION: NABL SCOPE // JPEG', '35 Integrated Labs Master Scope', NULL, 'Authoritative 35 Integrated Laboratories reference chart detailing all parameters, disciplines, and on-site/off-site calibration ranges.', 'assets/uploads/1791903325_Screen_Saver.png', 'Download')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, category = EXCLUDED.category, description = EXCLUDED.description,
  file_url = EXCLUDED.file_url, updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('md-portrait', 'Managing Director Portrait (Dr. Manikandan Venkatesan)', 'Dr. Manikandan Venkatesan, Managing Director', 'Managing Director''s Statement', 'leadership', 'assets/images/md-manikandan.jpg', 'Official portrait of Dr. Manikandan Venkatesan in Managing Director''s Statement section.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('facility-building', 'Reva Phoenix Headquarters Building', 'Madipakkam, Chennai, Tamil Nadu, India', 'Corporate Leadership Statement', 'leadership', 'assets/images/building-office.jpg', 'Featured building photo in Corporate Message & Leadership Commitment section.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('labs-reference-chart', '35 Integrated Labs Master Reference Chart', 'Authoritative NABL Scope Overview', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/35-integrated-labs-reference.jpeg', 'Authoritative master reference chart displaying full metrology scope in gallery.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('lab-dimensional', 'Dimension Calibration Cleanroom Suite', 'Class 1 Precision Laboratory', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/lab-dimension.jpg', 'Temperature controlled 20°C ± 1°C dimensional metrology laboratory photo.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('training-room', 'Executive Training Suite & Lecture Hall', 'Corporate & Lead Auditor Programs', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/training-room-1.jpg', 'Technical auditor and metrologist lecture hall photo in gallery.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('md-office', 'Executive Directorate & MD Office', 'MD Consultation Suite', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/md-office.jpg', 'Executive Directorate consultation suite photo in gallery.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('reception-counter', 'Corporate Reception Lounge & Intake Desk', 'First Floor Concierge Desk', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/reception-1.jpg', 'First floor corporate concierge & instrument receipt counter photo.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('lab-electrotechnical', 'Electro-Technical & RF Calibration Suite', 'AC/DC, Time & Frequency Standards', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/lab-electrotechnical.jpg', 'AC/DC, time, frequency, and RF standards laboratory photo.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('lab-thermal', 'Thermal & Relative Humidity Laboratory', 'Chamber Mapping to 1750°C', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/lab-thermal.jpg', 'Chamber mapping to 1750°C and pyrometry standards laboratory photo.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
INSERT INTO public.site_images (id, title, sub, section, category, path, description)
VALUES ('awards-photo', 'Industry & Metrology Excellence Awards', 'Recognized by Quality Councils', 'State-of-the-Art Infrastructure', 'infrastructure', 'assets/images/awards.jpg', 'Recognized quality council honors & national excellence awards photo.')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, sub = EXCLUDED.sub, section = EXCLUDED.section,
  category = EXCLUDED.category, path = EXCLUDED.path, description = EXCLUDED.description,
  updated_at = NOW();
