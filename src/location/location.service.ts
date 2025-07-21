import { Injectable } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrsGeocodingService } from './utils/ors.geocoding.service';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly ors: OrsGeocodingService,
  ) {}
   async createAddress(dto: CreateLocationDto): Promise<Location> {
    const fullLocation = `${dto.addressLine1 ?? ''}, ${dto.city ?? ''}, ${dto.state ?? ''}, ${dto.postalCode ?? ''}, ${dto.country ?? ''}`;
    const { lat, lng } = await this.ors.geocodeAddress(fullLocation);

    const location = this.locationRepo.create({
      ...dto,
      latitude: lat,
      longitude: lng,
    });

    return await this.locationRepo.save(location);
  }

  async findAddressesByOwner(ownerId: string): Promise<Location[]> {
    return this.locationRepo.find({
      where: { ownerId },
    });
  }
}

