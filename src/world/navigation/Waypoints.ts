import type { WorldDistrict } from "../core/WorldState";

export function teleportToDistrict(districts: WorldDistrict[], districtId: string) {
  return districts.find((district) => district.id === districtId) ?? districts[0];
}
