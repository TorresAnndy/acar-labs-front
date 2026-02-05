export interface Plan {
    id: number;
    name: string;
    slug: string;
    description?: string;
    price: number | string;
    billing_cycle: string;
    features: string[];
    is_active: boolean;
}
