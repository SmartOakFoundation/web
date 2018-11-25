export class JsonResponse{
    public status: number;
    public code: number;
    public data: any;
    public messages: any;
}

export class JsonResponseStatus {
    public static OK: number = 0;
    public static Error: number = 1;
}