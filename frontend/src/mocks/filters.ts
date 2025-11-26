export type FilterItem = {
    id: string;
    name: string;
    checked?: boolean;
};

export type FilterGroup = {
    id: string;
    title: string;
    items: FilterItem[];
};

export const filterGroups: FilterGroup[] = [
    {
        id: 'allergies',
        title: 'Allergies',
        items: [
            { id: 'gluten', name: 'Gluten' },
            { id: 'nuts', name: 'Noix' },
            { id: 'dairy', name: 'Produits laitiers' },
        ],
    },
    {
        id: 'ingredients',
        title: 'Ingredients',
        items: [
            { id: 'rice', name: 'Riz' },
            { id: 'tomato', name: 'Tomate' },
            { id: 'cucumber', name: 'Concombre' },
            { id: 'lettuce', name: 'Laitue' },
            { id: 'steak', name: 'Steak' },
            { id: 'pumpkin', name: 'Citrouille' },
        ],
    },
    {
        id: 'regime',
        title: 'Régimes',
        items: [
            { id: 'vegie', name: 'Végétarien' },
            { id: 'vegan', name: 'Vegan' },
            { id: 'glutenFree', name: 'Sans gluten' },
            { id: 'pescetarian', name: 'Pescetarien' },
        ],
    },
];
