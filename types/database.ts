export type UserRole = "customer" | "admin";
export type ProductStatus = "draft" | "active";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type CouponType = "percentage" | "fixed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          internal_notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          tagline: string | null;
          logo_url: string | null;
          logo_inverted_url: string | null;
          favicon_url: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          business_address: string | null;
          currency_code: string;
          currency_symbol: string;
          tax_rate: number;
          tax_inclusive: boolean;
          announcement_bar_active: boolean;
          announcement_bar_text: string | null;
          announcement_bar_link: string | null;
          announcement_bar_color: string | null;
          social_instagram: string | null;
          social_facebook: string | null;
          social_twitter: string | null;
          social_tiktok: string | null;
          social_youtube: string | null;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["site_settings"]["Row"]
        >;
        Update: Partial<
          Database["public"]["Tables"]["site_settings"]["Row"]
        >;
        Relationships: [];
      };
      seo_settings: {
        Row: {
          id: string;
          meta_title_template: string | null;
          default_meta_description: string | null;
          og_default_image_url: string | null;
          ga_tracking_id: string | null;
          fb_pixel_id: string | null;
          search_console_meta: string | null;
          robots_txt: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["seo_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["seo_settings"]["Row"]>;
        Relationships: [];
      };
      page_seo: {
        Row: {
          id: string;
          page_slug: string;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["page_seo"]["Row"]> & {
          page_slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["page_seo"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          price: number;
          sale_price: number | null;
          sale_start: string | null;
          sale_end: string | null;
          sku: string;
          stock_quantity: number;
          track_inventory: boolean;
          allow_backorders: boolean;
          status: ProductStatus;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          title: string;
          slug: string;
          sku: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
          alt_text: string | null;
        };
        Insert: Partial<
          Database["public"]["Tables"]["product_images"]["Row"]
        > & {
          product_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [];
      };
      product_options: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sort_order: number;
        };
        Insert: Partial<
          Database["public"]["Tables"]["product_options"]["Row"]
        > & {
          product_id: string;
          name: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_options"]["Row"]
        >;
        Relationships: [];
      };
      product_option_values: {
        Row: {
          id: string;
          option_id: string;
          value: string;
          sort_order: number;
        };
        Insert: Partial<
          Database["public"]["Tables"]["product_option_values"]["Row"]
        > & {
          option_id: string;
          value: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_option_values"]["Row"]
        >;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          price: number | null;
          stock_quantity: number;
          option_values: { option_name: string; value: string }[];
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["product_variants"]["Row"]
        > & {
          product_id: string;
          sku: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_variants"]["Row"]
        >;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string | null;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          zip: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["addresses"]["Row"]> & {
          user_id: string;
          full_name: string;
          address_line1: string;
          city: string;
          state: string;
          zip: string;
          country: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          shipping_method: string | null;
          shipping_cost: number;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total: number;
          coupon_code: string | null;
          payment_status: PaymentStatus;
          fulfillment_status: FulfillmentStatus;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          tracking_number: string | null;
          tracking_carrier: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          email: string;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          subtotal: number;
          total: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          title: string;
          variant_info: Record<string, unknown> | null;
          quantity: number;
          unit_price: number;
          line_total: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          title: string;
          quantity: number;
          unit_price: number;
          line_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      order_timeline: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["order_timeline"]["Row"]
        > & {
          order_id: string;
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_timeline"]["Row"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          product_id: string;
          user_id: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: CouponType;
          value: number;
          min_order_amount: number | null;
          usage_limit: number | null;
          per_customer_limit: number | null;
          times_used: number;
          valid_from: string | null;
          valid_to: string | null;
          applicable_products: string[] | null;
          applicable_categories: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coupons"]["Row"]> & {
          code: string;
          type: CouponType;
          value: number;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Row"]>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: { id?: string; email: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: [];
      };
      hero_slides: {
        Row: {
          id: string;
          image_url: string;
          heading: string;
          subheading: string | null;
          cta_text: string | null;
          cta_link: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["hero_slides"]["Row"]> & {
          image_url: string;
          heading: string;
        };
        Update: Partial<Database["public"]["Tables"]["hero_slides"]["Row"]>;
        Relationships: [];
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["wishlist"]["Row"]> & {
          user_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist"]["Row"]>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          url: string;
          filename: string;
          size: number | null;
          mime_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["media"]["Row"]> & {
          url: string;
          filename: string;
        };
        Update: Partial<Database["public"]["Tables"]["media"]["Row"]>;
        Relationships: [];
      };
      shipping_methods: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          estimated_delivery: string | null;
          free_shipping_threshold: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["shipping_methods"]["Row"]
        > & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipping_methods"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      payment_status: PaymentStatus;
      fulfillment_status: FulfillmentStatus;
      coupon_type: CouponType;
    };
    CompositeTypes: Record<string, never>;
  };
}
