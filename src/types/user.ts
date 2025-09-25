export interface User {
    _id: string;
    name?: string;
    email?: string;
    role: 'Customer' | 'DeliveryPartner' | 'StoreManager' | 'Admin';
    isActivated: boolean;
    phone: string;
    liveLocation?: {
        latitude?: number;
        longitude?: number;
    };
    address?: string;
}

export interface Customer extends User {
    role: 'Customer';
}

export interface DeliveryPartner extends User {
    role: 'DeliveryPartner';
    branch?: string; // Assuming branch is an ObjectId string
}

export interface LoginResponse {
    message: string;
    accessToken: string;
    refreshToken: string;
    customer?: Customer;
    deliveryPartner?: DeliveryPartner;
}
