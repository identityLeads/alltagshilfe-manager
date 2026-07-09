import {
  Broom,
  ShoppingCartSimple,
  TShirt,
  SprayBottle,
  PersonSimpleWalk,
  HandHeart,
  Brain,
  Car,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

export const SERVICE_ICON_OPTIONS: { value: string; label: string; Icon: ComponentType<IconProps> }[] = [
  { value: "ph ph-broom", label: "Besen (Haushalt)", Icon: Broom },
  { value: "ph ph-shopping-cart-simple", label: "Einkaufswagen", Icon: ShoppingCartSimple },
  { value: "ph ph-t-shirt", label: "T-Shirt (Wäsche)", Icon: TShirt },
  { value: "ph ph-spray-bottle", label: "Sprühflasche (Reinigung)", Icon: SprayBottle },
  { value: "ph ph-person-simple-walk", label: "Begleitung", Icon: PersonSimpleWalk },
  { value: "ph ph-hand-heart", label: "Betreuung", Icon: HandHeart },
  { value: "ph ph-brain", label: "Demenz", Icon: Brain },
  { value: "ph ph-car", label: "Fahrt", Icon: Car },
];

const ICON_MAP: Record<string, ComponentType<IconProps>> = Object.fromEntries(
  SERVICE_ICON_OPTIONS.map((o) => [o.value, o.Icon])
);

export function ServiceIcon({ icon, ...props }: { icon: string } & IconProps) {
  const Icon = ICON_MAP[icon] ?? HandHeart;
  return <Icon {...props} />;
}
