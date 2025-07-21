import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OrsGeocodingService {
  private readonly apiKey = process.env.ORS_API_KEY;

  async geocodeAddress(
    fullAddress: string,
  ): Promise<{ lat: number; lng: number }> {
    try {
      const response = await axios.get(
        'https://api.openrouteservice.org/geocode/search',
        {
          params: {
            api_key: this.apiKey,
            text: fullAddress,
          },
        },
      );

      const features = response.data.features;
      if (!features.length) {
        throw new Error('No results from ORS');
      }

      const [lng, lat] = features[0].geometry.coordinates;
      return { lat, lng };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new InternalServerErrorException('Geocoding failed');
    }
  }
}
