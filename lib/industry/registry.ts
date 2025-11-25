import { IndustryModule } from "./types";
import { padelModule } from "./modules/padel";
import { fnbModule } from "./modules/fnb";

const modules: Record<string, IndustryModule> = {
  padel: padelModule,
  fnb: fnbModule,
};

export function getIndustryModule(type: string): IndustryModule | null {
  return modules[type] || null;
}

export function getAllIndustryModules(): IndustryModule[] {
  return Object.values(modules);
}

