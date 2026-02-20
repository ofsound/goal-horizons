import {useRef, useMemo, useEffect} from "react";
import {Billboard, Text} from "@react-three/drei";
import * as THREE from "three";
import {addDays, format, startOfDay} from "date-fns";
import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {getEffectiveGlobeRadius, getGlobeCenterY, getGlobeRadius} from "../../utils/globe";
import {railPositionToDayRange} from "../../utils/dates";

/**
 * Globe mesh — the curved world surface.
 * Renders only the upper hemisphere as a large sphere.
 * Curvature morphs continuously from globe to near-flat.
 */
export default function Globe() {
  const curvature = useSettingsStore((s) => s.curvature);
  const gridOverlayEnabled = useSettingsStore((s) => s.gridOverlayEnabled);
  const gridLabelDensity = useSettingsStore((s) => s.gridLabelDensity);
  const simulatedDaysAhead = useSettingsStore((s) => s.simulatedDaysAhead);
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const theme = useTheme();
  const meshRef = useRef<THREE.Mesh>(null);
  const globeRadius = getGlobeRadius();
  const isFullyFlat = curvature >= 0.999;
  const maxDaysVisible = useMemo(() => railPositionToDayRange(railPosition), [railPosition]);
  const effectiveRadius = useMemo(() => getEffectiveGlobeRadius(curvature), [curvature]);
  const globeCenterY = useMemo(() => getGlobeCenterY(curvature), [curvature]);
  const flatPlaneSize = 560;
  const forwardDepth = useMemo(() => Math.PI * 0.45 * globeRadius, [globeRadius]);
  const simulatedBaseDate = useMemo(() => startOfDay(addDays(new Date(), simulatedDaysAhead)), [simulatedDaysAhead]);
  const gridColor = useMemo(() => {
    return new THREE.Color(theme.groundGridColor).lerp(new THREE.Color("#ffffff"), 0.62);
  }, [theme.groundGridColor]);
  const gridLabelColor = useMemo(() => new THREE.Color(theme.groundGridColor).lerp(new THREE.Color("#ffffff"), 0.45), [theme.groundGridColor]);
  const flatDayLines = useMemo(() => {
    if (!gridOverlayEnabled || !isFullyFlat) return [];
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const lines: {dayOffset: number; z: number}[] = [];

    for (let dayOffset = 0; dayOffset <= maxDaysVisible; dayOffset++) {
      const normalized = dayOffset / safeMaxDays;
      const z = -forwardDepth * Math.sqrt(normalized);
      lines.push({dayOffset, z});
    }

    return lines;
  }, [gridOverlayEnabled, isFullyFlat, maxDaysVisible, forwardDepth]);
  const curvedDayLines = useMemo(() => {
    if (!gridOverlayEnabled || isFullyFlat) return [];
    const safeMaxDays = Math.max(1, maxDaysVisible);
    const maxFutureAngle = Math.max(0.0001, Math.PI * 0.45 * (globeRadius / effectiveRadius));
    const lines: {dayOffset: number; theta: number; ringRadius: number; y: number}[] = [];

    for (let dayOffset = 0; dayOffset <= maxDaysVisible; dayOffset++) {
      const normalized = dayOffset / safeMaxDays;
      const theta = Math.sqrt(normalized) * maxFutureAngle;
      if (theta > Math.PI * 0.55) continue;
      lines.push({
        dayOffset,
        theta,
        ringRadius: effectiveRadius * Math.sin(theta),
        y: effectiveRadius * Math.cos(theta),
      });
    }
    return lines;
  }, [gridOverlayEnabled, isFullyFlat, maxDaysVisible, effectiveRadius, globeRadius]);

  // Create grid geometry for global overlay toggle
  const gridGeometry = useMemo(() => {
    if (!gridOverlayEnabled) return null;

    if (isFullyFlat) {
      const half = flatPlaneSize / 2;
      const step = 4;
      const points: THREE.Vector3[] = [];

      // Vertical lines
      for (let i = -half; i <= half; i += step) {
        points.push(new THREE.Vector3(i, 0, -half), new THREE.Vector3(i, 0, half));
      }

      // Horizontal timeline lines, mapped 1:1 to day offsets
      flatDayLines.forEach((line) => {
        points.push(new THREE.Vector3(-half, 0, line.z), new THREE.Vector3(half, 0, line.z));
      });

      return new THREE.BufferGeometry().setFromPoints(points);
    }

    const points: THREE.Vector3[] = [];

    // Latitude lines (rings) — one per day
    curvedDayLines.forEach((line) => {
      for (let j = 0; j <= 64; j++) {
        const phi1 = (j / 64) * Math.PI * 2;
        const phi2 = ((j + 1) / 64) * Math.PI * 2;
        points.push(
          new THREE.Vector3(line.ringRadius * Math.cos(phi1), line.y, line.ringRadius * Math.sin(phi1)),
          new THREE.Vector3(line.ringRadius * Math.cos(phi2), line.y, line.ringRadius * Math.sin(phi2)),
        );
      }
    });

    // Longitude lines (meridians)
    for (let i = 0; i < 56; i++) {
      const phi = (i / 56) * Math.PI * 2;
      for (let j = 0; j <= 56; j++) {
        const theta1 = (j / 72) * Math.PI;
        const theta2 = ((j + 1) / 72) * Math.PI;
        if (theta1 > Math.PI * 0.55 || theta2 > Math.PI * 0.55) continue;
        points.push(
          new THREE.Vector3(effectiveRadius * Math.sin(theta1) * Math.cos(phi), effectiveRadius * Math.cos(theta1), effectiveRadius * Math.sin(theta1) * Math.sin(phi)),
          new THREE.Vector3(effectiveRadius * Math.sin(theta2) * Math.cos(phi), effectiveRadius * Math.cos(theta2), effectiveRadius * Math.sin(theta2) * Math.sin(phi)),
        );
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [effectiveRadius, gridOverlayEnabled, isFullyFlat, flatDayLines, curvedDayLines]);

  useEffect(() => {
    const geo = gridGeometry;
    return () => geo?.dispose();
  }, [gridGeometry]);

  const gridDayLabels = useMemo(() => {
    if (!gridOverlayEnabled) return [];

    if (isFullyFlat) {
      const labelX = 18;
      return flatDayLines
        .filter((line) => line.dayOffset === 0 || line.dayOffset % gridLabelDensity === 0)
        .map((line) => ({
        key: `flat-day-${line.dayOffset}`,
        dayOffset: line.dayOffset,
        position: [labelX, globeRadius + 0.34, line.z] as [number, number, number],
        fontSize: 0.78,
        opacity: 0.52,
      }));
    }

    const labelPhi = -Math.PI / 2 + 0.24;
    return curvedDayLines
      .filter((line) => line.dayOffset === 0 || line.dayOffset % gridLabelDensity === 0)
      .map((line) => {
        const x = line.ringRadius * Math.cos(labelPhi);
        const z = line.ringRadius * Math.sin(labelPhi);
        const y = globeCenterY + line.y + 0.18;
        return {
          key: `curve-day-${line.dayOffset}`,
          dayOffset: line.dayOffset,
          position: [x + 0.55, y, z] as [number, number, number],
          fontSize: 0.58,
          opacity: 0.44,
        };
      });
  }, [gridOverlayEnabled, isFullyFlat, flatDayLines, curvedDayLines, globeCenterY, gridLabelDensity]);

  return (
    <group>
      {/* Main globe sphere */}
      {isFullyFlat ? (
        <mesh ref={meshRef} position={[0, globeRadius, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[flatPlaneSize, flatPlaneSize, 1, 1]} />
          <meshStandardMaterial color={theme.groundColor} emissive={theme.groundEmissive} emissiveIntensity={theme.groundEmissiveIntensity * 0.5} roughness={0.9} metalness={0.1} side={THREE.DoubleSide} />
        </mesh>
      ) : (
        <mesh ref={meshRef} position={[0, globeCenterY, 0]}>
          <sphereGeometry args={[effectiveRadius, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={theme.groundColor} emissive={theme.groundEmissive} emissiveIntensity={theme.groundEmissiveIntensity} roughness={0.9} metalness={0.1} side={THREE.FrontSide} />
        </mesh>
      )}

      {/* Grid overlay */}
      {gridOverlayEnabled && gridGeometry && (
        <lineSegments geometry={gridGeometry} position={isFullyFlat ? [0, globeRadius + 0.06, 0] : [0, globeCenterY, 0]}>
          <lineBasicMaterial color={gridColor} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      )}

      {/* Subtle date labels for horizontal grid lines, anchored to simulated "today" */}
      {gridOverlayEnabled && gridDayLabels.length > 0 && (
        <group>
          {gridDayLabels.map((label) => (
            <Billboard key={label.key} position={label.position}>
              <Text fontSize={label.fontSize} anchorX="left" anchorY="middle" color={gridLabelColor} material-transparent material-opacity={label.opacity} material-depthWrite={false} material-depthTest={false}>
                {label.dayOffset === 0 ? `Today · ${format(simulatedBaseDate, "MMM d")}` : format(addDays(simulatedBaseDate, label.dayOffset), "MMM d")}
              </Text>
            </Billboard>
          ))}
        </group>
      )}
    </group>
  );
}
