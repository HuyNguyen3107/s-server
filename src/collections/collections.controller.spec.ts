import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  let service: CollectionsService;

  const mockCollectionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByRouteName: jest.fn(),
    findHotCollections: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleStatus: jest.fn(),
  };

  const mockCollection = {
    id: 'uuid-test',
    name: 'Test Collection',
    imageUrl: 'https://example.com/test.jpg',
    routeName: 'test-collection',
    isHot: true,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        {
          provide: CollectionsService,
          useValue: mockCollectionsService,
        },
      ],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
    service = module.get<CollectionsService>(CollectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a collection', async () => {
      const createDto: CreateCollectionDto = {
        name: 'Test Collection',
        imageUrl: 'https://example.com/test.jpg',
        routeName: 'test-collection',
        isHot: true,
        status: 'active',
      };

      mockCollectionsService.create.mockResolvedValue(mockCollection);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCollection);
    });
  });

  describe('findAll', () => {
    it('should return an array of collections', async () => {
      const collections = [mockCollection];
      mockCollectionsService.findAll.mockResolvedValue(collections);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(collections);
    });
  });

  describe('findHotCollections', () => {
    it('should return hot collections', async () => {
      const hotCollections = [mockCollection];
      mockCollectionsService.findHotCollections.mockResolvedValue(
        hotCollections,
      );

      const result = await controller.findHotCollections();

      expect(service.findHotCollections).toHaveBeenCalled();
      expect(result).toEqual(hotCollections);
    });
  });

  describe('findByRouteName', () => {
    it('should return a collection by route name', async () => {
      mockCollectionsService.findByRouteName.mockResolvedValue(mockCollection);

      const result = await controller.findByRouteName('test-collection');

      expect(service.findByRouteName).toHaveBeenCalledWith('test-collection');
      expect(result).toEqual(mockCollection);
    });
  });

  describe('findOne', () => {
    it('should return a collection by id', async () => {
      mockCollectionsService.findOne.mockResolvedValue(mockCollection);

      const result = await controller.findOne('uuid-test');

      expect(service.findOne).toHaveBeenCalledWith('uuid-test');
      expect(result).toEqual(mockCollection);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection',
      };
      const updatedCollection = {
        ...mockCollection,
        name: 'Updated Collection',
      };

      mockCollectionsService.update.mockResolvedValue(updatedCollection);

      const result = await controller.update('uuid-test', updateDto);

      expect(service.update).toHaveBeenCalledWith('uuid-test', updateDto);
      expect(result).toEqual(updatedCollection);
    });
  });

  describe('toggleStatus', () => {
    it('should toggle collection status', async () => {
      const toggledCollection = { ...mockCollection, status: 'inactive' };
      mockCollectionsService.toggleStatus.mockResolvedValue(toggledCollection);

      const result = await controller.toggleStatus('uuid-test');

      expect(service.toggleStatus).toHaveBeenCalledWith('uuid-test');
      expect(result).toEqual(toggledCollection);
    });
  });

  describe('remove', () => {
    it('should remove a collection', async () => {
      const deleteResult = { message: 'Xóa bộ sưu tập thành công' };
      mockCollectionsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('uuid-test');

      expect(service.remove).toHaveBeenCalledWith('uuid-test');
      expect(result).toEqual(deleteResult);
    });
  });
});
