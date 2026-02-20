import * as THREE from 'three';
import { daysFromToday } from './dates';
import type { HorizonMode } from '../types/goal';

// Globe configuration
const GLOBE_RADIUS = 80;
const MAX_FUTURE_ANGLE = Math.PI * 0.45; // Forward arc (almost to equator)
const MAX_PAST_ANGLE = Math.PI * 0.25;   // Backward arc for past goals
const BILLBOARD_HEIGHT_ABOVE_SURFACE = 1.5;
const FLAT_RADIUS_MULTIPLIER = 24;
const FLAT_MIX_START = 0.8;

export const HORIZON_PRESET_CURVATURE: Record<HorizonMode, number> = {
    hard: 0,
    subtle: 0.5,
    fog: 1,
};

function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function horizonModeToCurvature(mode: HorizonMode): number {
    return HORIZON_PRESET_CURVATURE[mode];
}

export function curvatureToNearestHorizonMode(curvature: number): HorizonMode {
    const c = clamp01(curvature);
    if (c < 0.25) return 'hard';
    if (c < 0.75) return 'subtle';
    return 'fog';
}

export function getCurvatureRadiusMultiplier(curvature: number): number {
    const c = clamp01(curvature);
    if (c <= 0.5) {
        return THREE.MathUtils.lerp(1, 2.5, c / 0.5);
    }
    return THREE.MathUtils.lerp(2.5, FLAT_RADIUS_MULTIPLIER, (c - 0.5) / 0.5);
}

export function getEffectiveGlobeRadius(curvature: number): number {
    return GLOBE_RADIUS * getCurvatureRadiusMultiplier(curvature);
}

const FORWARD_DEPTH = Math.PI * 0.45 * GLOBE_RADIUS;

/**
 * Convert a forward day offset into a Z translation for the flat timeline.
 * Used when curvature is high: moves the timeline straight towards the camera
 * one day at a time, matching the spacing of the flat grid.
 */
export function dayOffsetToFlatTimelineTranslation(
    dayOffset: number,
    maxDaysVisible: number,
): number {
    const days = Math.max(0, dayOffset);
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const normalized = days / safeMaxDays;
    return FORWARD_DEPTH * Math.sqrt(normalized);
}

/**
 * Convert a forward day offset into a timeline rotation angle.
 * Uses the same spacing curve as the goal/grid day mapping.
 */
export function dayOffsetToTimelineAngle(
    dayOffset: number,
    maxDaysVisible: number,
    curvature: number,
): number {
    const days = Math.max(0, dayOffset);
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const c = clamp01(curvature);
    const effectiveRadius = getEffectiveGlobeRadius(c);
    const angleScale = GLOBE_RADIUS / effectiveRadius;
    const maxAngle = MAX_FUTURE_ANGLE * angleScale;
    const normalizedDistance = days / safeMaxDays;
    return Math.sqrt(normalizedDistance) * maxAngle;
}

function getFlatMix(curvature: number): number {
    return THREE.MathUtils.smoothstep(clamp01(curvature), FLAT_MIX_START, 1);
}

/**
 * Keep the "today" point anchored while curvature changes.
 */
export function getGlobeCenterY(curvature: number): number {
    return GLOBE_RADIUS - getEffectiveGlobeRadius(curvature);
}

/**
 * Convert a goal date and same-day index to a 3D position on the globe surface.
 * 
 * The camera sits at the "top" of the sphere, looking forward along the surface.
 * Future goals go forward (positive θ from pole), past goals go backward.
 * Same-day goals spread laterally (φ angle).
 * 
 * @param dateStr - The goal's date string (ISO)
 * @param sameDayIndex - Index among goals on the same day (0, 1, 2...)
 * @param sameDayTotal - Total goals on the same day
 * @param maxDaysVisible - Maximum days the current view shows
 * @returns THREE.Vector3 position on globe surface
 */
export function goalToGlobePosition(
    dateStr: string,
    sameDayIndex: number,
    sameDayTotal: number,
    maxDaysVisible: number,
    curvature: number = 0,
    simulatedDaysAhead: number = 0,
): THREE.Vector3 {
    const c = clamp01(curvature);
    const days = daysFromToday(dateStr, simulatedDaysAhead);
    const effectiveRadius = getEffectiveGlobeRadius(c);
    const centerY = getGlobeCenterY(c);
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const angleScale = GLOBE_RADIUS / effectiveRadius;
    const flatMix = getFlatMix(c);

    // Theta: angle from north pole. 0 = pole (today), positive = forward
    const maxAngle = (days >= 0 ? MAX_FUTURE_ANGLE : MAX_PAST_ANGLE) * angleScale;
    const normalizedDistance = Math.min(Math.abs(days) / safeMaxDays, 1);
    // Use square root for better near-distance spacing
    const theta = Math.sqrt(normalizedDistance) * maxAngle;
    const signedTheta = days >= 0 ? theta : -theta;

    // Phi: lateral spread for same-day goals
    const spreadAngle = Math.PI * 0.15; // Max lateral spread
    let phi = 0;
    if (sameDayTotal > 1) {
        const step = spreadAngle / (sameDayTotal - 1);
        phi = -spreadAngle / 2 + step * sameDayIndex;
    }

    // Spherical to cartesian (Y-up convention)
    // North pole is at (0, radius, 0)
    const r = effectiveRadius + BILLBOARD_HEIGHT_ABOVE_SURFACE;
    const x = r * Math.sin(signedTheta) * Math.sin(phi);
    const y = centerY + r * Math.cos(signedTheta);
    const z = -r * Math.sin(signedTheta) * Math.cos(phi);
    const arcDistance = signedTheta * effectiveRadius;
    const flatX = arcDistance * Math.sin(phi);
    const flatY = GLOBE_RADIUS + BILLBOARD_HEIGHT_ABOVE_SURFACE;
    const flatZ = -arcDistance * Math.cos(phi);

    return new THREE.Vector3(
        THREE.MathUtils.lerp(x, flatX, flatMix),
        THREE.MathUtils.lerp(y, flatY, flatMix),
        THREE.MathUtils.lerp(z, flatZ, flatMix),
    );
}

/**
 * Get the up-vector for a billboard at a given position on the globe.
 * Points radially outward from globe center.
 */
export function getGlobeNormal(position: THREE.Vector3): THREE.Vector3 {
    return position.clone().normalize();
}

/**
 * Camera position on the globe surface for a given rail position.
 * Rail 0 = sitting at the pole (today), looking ahead at near goals.
 * Actually, the camera is always near the pole but tilted to see further.
 */
export function getCameraPosition(railPosition: number, curvature: number = 0): THREE.Vector3 {
    const clampedRail = clamp01(railPosition);
    const flatMix = getFlatMix(curvature);
    // Camera sits slightly above the pole, tilted forward based on rail
    const hardElevation = 8 + clampedRail * 15;
    const flatElevation = 6 + clampedRail * 10;
    const elevationAboveSurface = THREE.MathUtils.lerp(hardElevation, flatElevation, flatMix);
    return new THREE.Vector3(0, GLOBE_RADIUS + elevationAboveSurface, 2);
}

/**
 * Camera look-at target for a given rail position.
 */
export function getCameraTarget(railPosition: number, lookingBack: boolean, curvature: number = 0): THREE.Vector3 {
    const c = clamp01(curvature);
    const radius = getEffectiveGlobeRadius(c);
    const centerY = getGlobeCenterY(c);
    const flatMix = getFlatMix(c);
    const clampedRail = clamp01(railPosition);
    const baseForwardAngle = 0.15 + clampedRail * 0.35;
    const forwardAngle = baseForwardAngle * (GLOBE_RADIUS / radius);
    const angle = lookingBack ? -forwardAngle : forwardAngle;

    const curvedY = centerY + radius * Math.cos(angle);
    const curvedZ = -radius * Math.sin(angle);
    const flatDistance = baseForwardAngle * GLOBE_RADIUS;
    const flatY = GLOBE_RADIUS;
    const flatZ = lookingBack ? flatDistance : -flatDistance;

    return new THREE.Vector3(
        0,
        THREE.MathUtils.lerp(curvedY, flatY, flatMix),
        THREE.MathUtils.lerp(curvedZ, flatZ, flatMix),
    );
}

/**
 * Get the globe radius.
 */
export function getGlobeRadius(): number {
    return GLOBE_RADIUS;
}

/**
 * Check if a goal at a given distance should be visible in the given horizon mode.
 */
export function isGoalVisible(
    days: number,
    maxDaysVisible: number,
    curvature: number,
): boolean {
    return getGoalOpacity(days, maxDaysVisible, curvature) > 0.01;
}

function getHardOpacity(normalizedDist: number): number {
    if (normalizedDist > 1) return 0;
    if (normalizedDist > 0.85) return 1 - (normalizedDist - 0.85) / 0.15;
    return 1;
}

function getSubtleOpacity(normalizedDist: number): number {
    if (normalizedDist > 2) return 0;
    if (normalizedDist > 1) return Math.max(0, 1 - (normalizedDist - 1) * 0.7);
    return 1;
}

function getFogOpacity(normalizedDist: number): number {
    if (normalizedDist > 2) return 0;
    return Math.max(0.05, 1 - normalizedDist * 0.5);
}

/**
 * Get opacity for a goal based on distance and curvature.
 */
export function getGoalOpacity(
    days: number,
    maxDaysVisible: number,
    curvature: number,
): number {
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const normalizedDist = Math.abs(days) / safeMaxDays;
    const c = clamp01(curvature);

    const hardOpacity = getHardOpacity(normalizedDist);
    const subtleOpacity = getSubtleOpacity(normalizedDist);
    const fogOpacity = getFogOpacity(normalizedDist);

    if (c <= 0.5) {
        return THREE.MathUtils.lerp(hardOpacity, subtleOpacity, c / 0.5);
    }
    return THREE.MathUtils.lerp(subtleOpacity, fogOpacity, (c - 0.5) / 0.5);
}

/**
 * Get billboard scale based on priority.
 */
export function getPriorityScale(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
        case 'low': return 1.0;
        case 'medium': return 1.4;
        case 'high': return 1.8;
    }
}
