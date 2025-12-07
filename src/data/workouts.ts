import { WorkoutTemplate } from "../types";

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "lower_a",
    name: "Lower A – Hinge & Glutes",
    description: "Posterior-chain focused lower body. Best on non-hard-run days.",
    tags: ["lower", "hinge", "glutes"],
    sections: [
      { label: "Main hinge (pick 1)", exerciseIds: ["rdl", "trap_bar_deadlift", "cable_pull_through"] },
      { label: "Glute power (pick 1)", exerciseIds: ["hip_thrust_barbell", "glute_bridge_db"] },
      { label: "Single-leg (pick 1)", exerciseIds: ["bulgarian_split_squat", "reverse_lunge", "step_up"] },
      { label: "Hamstring accessory (pick 0–1)", exerciseIds: ["seated_hamstring_curl", "lying_hamstring_curl"] },
      { label: "Posture pull (pick 1)", exerciseIds: ["chest_supported_row", "seated_cable_row"] },
      { label: "Calves/Tib (pick 1–2)", exerciseIds: ["seated_calf_raise", "standing_calf_raise", "tibialis_raise", "calf_isometric_hold"] },
      { label: "Core (pick 0–1)", exerciseIds: ["dead_bug", "pallof_press"] }
    ]
  },
  {
    id: "upper_a",
    name: "Upper A – Posture & Pull Emphasis",
    description: "Upper body with extra focus on upper back and posture.",
    tags: ["upper", "posture", "pull"],
    sections: [
      { label: "Heavy pull (pick 1–2)", exerciseIds: ["chest_supported_row", "seated_cable_row", "lat_pulldown"] },
      { label: "Rear delt / scap (pick 1–2)", exerciseIds: ["face_pull", "reverse_pec_deck", "band_pull_apart", "external_rotation_cable"] },
      { label: "Push (pick 1–2)", exerciseIds: ["incline_db_press", "machine_chest_press", "landmine_press"] },
      { label: "Neck / serratus (pick 1)", exerciseIds: ["chin_tuck", "wall_slide"] },
      { label: "Core / carry (pick 1)", exerciseIds: ["side_plank", "suitcase_carry"] }
    ]
  },
  {
    id: "support_lower",
    name: "Support Lower – Stability & Tendon",
    description: "Lighter lower day to support running and manage tendons.",
    tags: ["lower", "support", "stability", "tendon"],
    sections: [
      { label: "Single-leg stability (pick 1–2)", exerciseIds: ["reverse_lunge", "step_up", "single_leg_leg_press"] },
      { label: "Light posterior chain (pick 1)", exerciseIds: ["back_extension_glutes", "cable_pull_through"] },
      { label: "Hip / glute med (pick 1)", exerciseIds: ["lateral_raise"] }, // add hip abduction ID later if desired
      { label: "Calf / Achilles toolkit (pick 2)", exerciseIds: ["seated_calf_raise", "standing_calf_raise", "calf_isometric_hold", "tibialis_raise"] },
      { label: "Posture pull (pick 1)", exerciseIds: ["seated_cable_row", "face_pull"] },
      { label: "Core (pick 1)", exerciseIds: ["pallof_press", "dead_bug"] }
    ]
  },
  {
    id: "lower_b",
    name: "Lower B – Squat & Single-Leg",
    description: "Squat-focused lower day to build general strength.",
    tags: ["lower", "squat"],
    sections: [
      { label: "Main squat (pick 1)", exerciseIds: ["goblet_squat", "hack_squat_machine", "leg_press"] },
      { label: "Secondary lower (pick 1)", exerciseIds: ["rdl", "hip_thrust_barbell", "cable_pull_through"] },
      { label: "Single-leg (pick 1)", exerciseIds: ["bulgarian_split_squat", "reverse_lunge", "step_up"] },
      { label: "Posture pull (pick 1)", exerciseIds: ["chest_supported_row", "lat_pulldown"] },
      { label: "Calves/Tib (pick 1–2)", exerciseIds: ["seated_calf_raise", "standing_calf_raise", "tibialis_raise"] },
      { label: "Core (pick 0–1)", exerciseIds: ["side_plank", "suitcase_carry"] }
    ]
  },
  {
    id: "upper_b",
    name: "Upper B – Shoulders & Arms",
    description: "Upper body with extra physique work for shoulders and arms, plus posture insurance.",
    tags: ["upper", "shoulders", "arms"],
    sections: [
      { label: "Pull (pick 1–2)", exerciseIds: ["lat_pulldown", "one_arm_cable_row", "chest_supported_row"] },
      { label: "Push (pick 1–2)", exerciseIds: ["incline_db_press", "machine_chest_press", "cable_press_single_arm"] },
      { label: "Shoulders (pick 1)", exerciseIds: ["lateral_raise"] },
      { label: "Posture / rotator cuff (pick 1–2)", exerciseIds: ["face_pull", "reverse_pec_deck", "external_rotation_cable"] },
      { label: "Core / carry (pick 1)", exerciseIds: ["farmer_carry", "side_plank"] }
    ]
  },
  {
    id: "posture_core_reset",
    name: "Posture & Core Reset",
    description: "Lighter day to undo desk posture and build core endurance.",
    tags: ["upper", "posture", "core", "light"],
    sections: [
      { label: "T-spine / mobility (pick 2)", exerciseIds: ["thoracic_extension_roller", "open_book", "pec_doorway_stretch"] },
      { label: "Scap / posture circuit (pick 3)", exerciseIds: ["face_pull", "band_pull_apart", "reverse_pec_deck", "wall_slide"] },
      { label: "Neck (pick 1)", exerciseIds: ["chin_tuck"] },
      { label: "Core (pick 2)", exerciseIds: ["dead_bug", "pallof_press", "side_plank"] }
    ]
  },
  {
    id: "full_body_quick",
    name: "Full Body – Busy Day",
    description: "One of everything when you’re short on time.",
    tags: ["full", "quick"],
    sections: [
      { label: "Squat (pick 1)", exerciseIds: ["hack_squat_machine", "goblet_squat"] },
      { label: "Hinge (pick 1)", exerciseIds: ["rdl", "cable_pull_through"] },
      { label: "Pull (pick 1)", exerciseIds: ["seated_cable_row", "lat_pulldown"] },
      { label: "Push (pick 1)", exerciseIds: ["incline_db_press", "landmine_press"] },
      { label: "Single-leg (pick 1)", exerciseIds: ["step_up", "reverse_lunge"] },
      { label: "Calves/Tib (pick 1)", exerciseIds: ["seated_calf_raise", "tibialis_raise"] },
      { label: "Core / carry (pick 1)", exerciseIds: ["suitcase_carry", "dead_bug"] }
    ]
  }
];
