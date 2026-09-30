/*
 * Shared service data for Tabibi
 * Used by:
 * - ServiceList.jsx
 * - AllServices.jsx
 *
 * Layout:
 * 01 → icon → service name → arrow
 */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/* ---------- Symptoms ---------- */

// Stomach + pain marks on the left
const StomachIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M9 3v3.5C9 8 10 9 12 9.5c4 1 7 2.5 7 6a5 5 0 0 1-5 5c-4.5 0-8-3.5-8-8.5 0-2 .5-3 1.5-4.5" />
    <path d="M9 3H7.5" />
    <path d="M3 13H1.5" />
    <path d="M3.6 16.4l-1.3 1" />
    <path d="M3.6 9.6l-1.3-1" />
  </svg>
);

// Head + lightning bolt (migraine / headache)
const HeadacheIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="12" cy="12" r="6.5" />
    <path d="M12.8 8l-2.4 4h3.2l-2.4 4" />
    <path d="M12 2.5V1" />
    <path d="M4.8 5.3 3.7 4.2" />
    <path d="M19.2 5.3l1.1-1.1" />
    <path d="M21.5 12H23" />
    <path d="M1 12h1.5" />
  </svg>
);

// Face with pimples
const AcneIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="8.5" cy="14.5" r="1.3" />
    <circle cx="15.5" cy="9.5" r="1.3" />
    <circle cx="15" cy="15.5" r="1" />
    <circle cx="7.5" cy="8" r=".9" />
  </svg>
);

// Thermometer + heat waves
const ThermometerIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M9 14.5V5a2.5 2.5 0 0 1 5 0v9.5a4 4 0 1 1-5 0Z" />
    <path d="M11.5 8v8" />
    <circle cx="11.5" cy="17" r="1" />
    <path d="M17 5c1 1 1 2.2 0 3.2" />
    <path d="M20 4c1.3 1.3 1.3 3.2 0 4.5" />
  </svg>
);

// Sad face with tear
const DepressionIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.8 9.5h.01" />
    <path d="M15.2 9.5h.01" />
    <path d="M8.5 16.5c.9-1.1 2-1.6 3.5-1.6s2.6.5 3.5 1.6" />
    <path d="M8.8 11.6c.6.8.6 1.5 0 2.1-.6-.6-.6-1.3 0-2.1Z" />
  </svg>
);

// Glucose meter with blood drop
const DiabetesIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <rect x="8.5" y="5" width="7" height="3.5" rx=".8" />
    <path d="M12 11s2.6 2.7 2.6 4.6a2.6 2.6 0 0 1-5.2 0C9.4 13.7 12 11 12 11Z" />
  </svg>
);

// Lungs (cough)
const CoughIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M12 3v8" />
    <path d="M12 11l-3 2.2" />
    <path d="M12 11l3 2.2" />
    <path d="M9 8c-2.6 0-4.8 4-4.8 9 0 2 1 3.2 2.6 3.2S9 19 9 17.5V8Z" />
    <path d="M15 8c2.6 0 4.8 4 4.8 9 0 2-1 3.2-2.6 3.2S15 19 15 17.5V8Z" />
  </svg>
);

// Head with strands of hair falling
const HairIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="9.5" cy="10" r="5" />
    <path d="M6.5 6.5c1-1.3 2.2-1.8 3.5-1.8" />
    <path d="M6 15.5c-2 1-3 2.5-3 5" />
    <path d="M13 15.5c2 1 3 2.5 3 5" />
    <path d="M17.5 4c1.5 2 1.5 4 0 6" />
    <path d="M20.5 9c1 1.5 1 3 0 4.5" />
    <path d="M18 15c1 1.2 1 2.5 0 3.7" />
  </svg>
);

// Gastritis: stomach with inflamed spots
const GastritisIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M9 3v3.5C9 8 10 9 12 9.5c4 1 7 2.5 7 6a5 5 0 0 1-5 5c-4.5 0-8-3.5-8-8.5 0-2 .5-3 1.5-4.5" />
    <path d="M9 3H7.5" />
    <circle cx="10.5" cy="14" r=".9" />
    <circle cx="14.5" cy="16.5" r=".9" />
    <circle cx="14.5" cy="12.8" r=".9" />
  </svg>
);

// Human figure with pain marks
const BodyPainIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="12" cy="4.5" r="2.2" />
    <path d="M12 7.5v6.5" />
    <path d="M7 10.5l5-3 5 3" />
    <path d="M12 14l-3 6.5" />
    <path d="M12 14l3 6.5" />
    <path d="M5.5 12.5H4" />
    <path d="M6.2 15.2l-1.2 1" />
    <path d="M18.5 12.5H20" />
    <path d="M17.8 15.2l1.2 1" />
  </svg>
);

/* ---------- Specialties ---------- */

// Stethoscope
const StethoscopeIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M6 3H4.5" />
    <path d="M14 3h1.5" />
    <path d="M10 13v2a5 5 0 0 0 10 0v-2.5" />
    <circle cx="20" cy="11" r="1.8" />
  </svg>
);

// Magnifier over skin spots (dermatology)
const SkinIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="M14.8 14.8 21 21" />
    <circle cx="8" cy="9" r=".8" />
    <circle cx="12.5" cy="8" r=".9" />
    <circle cx="10.5" cy="12.3" r="1" />
  </svg>
);

// Bone
const BoneIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" />
  </svg>
);

// Ear
const EarIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
    <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4" />
  </svg>
);

// Head profile with a heart (mental health / therapy)
const BrainIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M9 21v-3.2C6.6 16.3 5 13.8 5 10.8A7 7 0 0 1 12 3.5a7 7 0 0 1 7 7.2c0 1.3-.4 2.3-1 3.3l1.2 1.7-1.7.6V19a2 2 0 0 1-2 2H9Z" />
    <path d="M12.5 14.5s-3-1.7-3-3.6a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1.9-3 3.6-3 3.6Z" />
  </svg>
);

// Tooth
const ToothIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M12 6.5C11 5 9 4.6 7.5 5 5.5 5.7 5 8 5.8 10.5c.6 1.8 1 3 1.2 5 .2 1.8.6 4.5 2 4.5 1.5 0 1.5-3 2-4.5Q12 14.5 13 15.5c.5 1.5.5 4.5 2 4.5 1.4 0 1.8-2.7 2-4.5.2-2 .6-3.2 1.2-5C19 8 18.5 5.7 16.5 5 15 4.6 13 5 12 6.5Z" />
  </svg>
);

// Heart with pulse line
const HeartIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);

// Female symbol (venus)
const GynecologyIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="12" cy="9" r="5" />
    <path d="M12 14v7" />
    <path d="M9 18h6" />
  </svg>
);

// Apple with leaf
const DietitianIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <path d="M12 7c-1.5-1-4-1.5-5.5.5C4.5 10 5.5 15 8 18.5c1.2 1.6 2.6 1.8 4 1 1.4.8 2.8.6 4-1 2.5-3.5 3.5-8.5 1.5-11C16 5.5 13.5 6 12 7Z" />
    <path d="M12 7c0-1.5.6-2.8 2-3.5" />
  </svg>
);

// Male + female symbols (sexual health)
const SexologyIcon = ({ size = 20, strokeWidth = 1.6 }) => (
  <svg {...iconProps} strokeWidth={strokeWidth} width={size} height={size}>
    <circle cx="8" cy="9" r="3.5" />
    <path d="M8 12.5V19" />
    <path d="M5.5 16h5" />
    <circle cx="16" cy="14.5" r="3.5" />
    <path d="M18.5 12 21 9.5" />
    <path d="M17.5 9.5H21V13" />
  </svg>
);

export const symptoms = [
  {
    name: "Stomach ache",
    icon: StomachIcon,
  },
  {
    name: "Migraine & headache",
    icon: HeadacheIcon,
  },
  {
    name: "Acne and pimples",
    icon: AcneIcon,
  },
  {
    name: "Fever",
    icon: ThermometerIcon,
  },
  {
    name: "Depression",
    icon: DepressionIcon,
  },
  {
    name: "Diabetes",
    icon: DiabetesIcon,
  },
  {
    name: "Cough",
    icon: CoughIcon,
  },
  {
    name: "Hair fall",
    icon: HairIcon,
  },
  {
    name: "Gastritis",
    icon: GastritisIcon,
  },
  {
    name: "Body pain",
    icon: BodyPainIcon,
  },
];

export const specialties = [
  {
    name: "Physician",
    icon: StethoscopeIcon,
  },
  {
    name: "Dermatologist",
    icon: SkinIcon,
  },
  {
    name: "Orthopedist",
    icon: BoneIcon,
  },
  {
    name: "ENT specialist",
    icon: EarIcon,
  },
  {
    name: "Psychotherapist",
    icon: BrainIcon,
  },
  {
    name: "Dentist",
    icon: ToothIcon,
  },
  {
    name: "Cardiologist",
    icon: HeartIcon,
  },
  {
    name: "Gynecologist",
    icon: GynecologyIcon,
  },
  {
    name: "Dietitian",
    icon: DietitianIcon,
  },
  {
    name: "Sexologist",
    icon: SexologyIcon,
  },
];

export const serviceLists = {
  symptoms,
  specialties,
};

export const serviceTabs = [
  {
    key: "symptoms",
    label: "By symptom",
  },
  {
    key: "specialties",
    label: "By specialty",
  },
];