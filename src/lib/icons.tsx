import {
  ShoppingCart,
  Utensils,
  Car,
  FileText,
  Clapperboard,
  HeartPulse,
  ShoppingBasket,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { ExpenseCategory } from './types';

export const getCategoryIcon = (category: string) => {
  const iconProps: LucideProps = {
    className: 'h-4 w-4',
  };

  const categoryMap: Record<ExpenseCategory, JSX.Element> = {
    Shopping: <ShoppingCart {...iconProps} />,
    Food: <Utensils {...iconProps} />,
    Transport: <Car {...iconProps} />,
    Bills: <FileText {...iconProps} />,
    Entertainment: <Clapperboard {...iconProps} />,
    Health: <HeartPulse {...iconProps} />,
    Groceries: <ShoppingBasket {...iconProps} />,
    Other: <HelpCircle {...iconProps} />,
  };
  
  return categoryMap[category as ExpenseCategory] || <HelpCircle {...iconProps} />;
};
