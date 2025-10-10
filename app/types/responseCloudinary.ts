export interface CloudinaryResponse {
    resources:CloudinaryResource[];
    next_cursor?: string;
    total_count?: number;
}
export interface CloudinaryResource {
    asset_folder: string;
    asset_id: string;
    bytes: number;
    created_at: string;
    display_name: string;
    format: string;
    height: number;
    public_id: string;
    resource_type: string;
    secure_url: string;
    type: string;
    url: string;
    version: number;
    width: number;
    aspect?: "tall"|"wide"|"square"|"short"|"medium"
}