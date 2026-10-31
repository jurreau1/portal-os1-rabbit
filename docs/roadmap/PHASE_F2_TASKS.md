# Phase F2 Tasks

## Task Group 1 — ThreeJS Foundation

Files:

- `src/world/scene/SceneRoot.tsx`
- `src/world/scene/Camera.tsx`
- `src/world/scene/Lighting.tsx`
- `src/world/scene/Ground.tsx`
- `src/world/scene/Skybox.tsx`

Tasks:

- Install `@react-three/fiber`
- Install `@react-three/drei`
- SceneRoot mounted
- Camera operational
- Ambient lighting
- Directional lighting

## Task Group 2 — Nexus Environment

Files:

- `src/world/districts/Nexus/NexusScene.tsx`
- `src/world/districts/Nexus/PortalRing.tsx`
- `src/world/districts/Nexus/CommandTower.tsx`
- `src/world/districts/Nexus/WorldMap.tsx`

Tasks:

- Spawn area
- Command tower
- Portal ring
- District labels
- Navigation panel

## Task Group 3 — Player Controller

Files:

- `src/world/player/PlayerController.tsx`
- `src/world/player/Movement.ts`
- `src/world/player/CameraController.tsx`

Tasks:

- WASD movement
- Mouse look
- Touch controls
- Teleport support

## Task Group 4 — Portal Structures

Files:

- `src/world/entities/Portal.tsx`
- `src/world/entities/PortalLabel.tsx`
- `src/world/entities/PortalTrigger.tsx`

Tasks:

- Games portal
- Apps portal
- Media portal
- Research portal
- Creator portal
- Marketplace portal
- AI portal

## Task Group 5 — HUD Layer

Files:

- `src/world/ui/HUD.tsx`
- `src/world/ui/Minimap.tsx`
- `src/world/ui/DistrictOverlay.tsx`

Tasks:

- District name
- Active location
- Return portal button
- Teleport controls
- Minimap

## Task Group 6 — Registry Integration

Tasks:

- Games District reads `gamesRegistry`
- Apps District reads `appsRegistry`
- Media District reads `mediaRegistry`
- Research District reads `researchRegistry`
- Creator District reads `creatorRegistry`

## Phase F2 Exit Criteria

A user can:

1. Open MAXVERSE
2. Enter World
3. Spawn In 3D Nexus
4. Move Character
5. View Portal Ring
6. Choose District
7. Teleport
8. Return To Nexus
9. Return To Portal

with:

- 60 FPS desktop
- 45 FPS tablet
- 30 FPS mobile

and no TypeScript, routing, registry, or command execution errors.
