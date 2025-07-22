import 'dotenv/config';
import { PinataSDK } from 'pinata';
import type { IPFSUploadResult, SuperheroMetadata, IdeaMetadata } from '@/types';

export class IPFSService {
  private pinata: PinataSDK;

  constructor() {
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT!,
      pinataGateway: 'gateway.pinata.cloud'
    });
    
    console.log('🔧 IPFS Service initialized with Pinata');
  }

  // Upload file to IPFS
  async uploadFile(file: File | Blob, name?: string): Promise<IPFSUploadResult> {
    try {
      console.log('📤 Uploading file to Pinata via direct API...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: name || 'uploaded-file'
      }));
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      }));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }

      const upload = await response.json();
      console.log('✅ File uploaded successfully:', upload.IpfsHash);

      return {
        hash: upload.IpfsHash,
        url: `ipfs://${upload.IpfsHash}`,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new Error(`Failed to upload file to IPFS: ${error}`);
    }
  }

  // Upload JSON metadata to IPFS
  async uploadJSON(data: object, name?: string): Promise<IPFSUploadResult> {
    try {
      console.log('📤 Uploading JSON metadata to Pinata...');
      
      const formData = new FormData();
      formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      formData.append('pinataMetadata', JSON.stringify({
        name: name || 'metadata.json'
      }));
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      }));

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }

      const upload = await response.json();
      console.log('✅ JSON uploaded successfully:', upload.IpfsHash);

      return {
        hash: upload.IpfsHash,
        url: `ipfs://${upload.IpfsHash}`,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`
      };
    } catch (error) {
      console.error('❌ JSON upload failed:', error.message);
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  // Create and upload superhero metadata
  async createSuperheroMetadata(data: {
    name: string;
    bio: string;
    skills: string[];
    specialities: string[];
    avatarHash?: string;
  }): Promise<IPFSUploadResult> {
    const metadata: SuperheroMetadata = {
      name: data.name,
      description: data.bio,
      image: data.avatarHash ? `ipfs://${data.avatarHash}` : '',
      attributes: [
        ...data.skills.map(skill => ({
          trait_type: 'Skill',
          value: skill
        })),
        ...data.specialities.map(speciality => ({
          trait_type: 'Speciality',
          value: speciality
        }))
      ],
      skills: data.skills,
      specialities: data.specialities
    };

    return this.uploadJSON(metadata, `${data.name}-superhero-metadata.json`);
  }

  // Create and upload idea metadata
  async createIdeaMetadata(data: {
    title: string;
    description: string;
    categories: string[];
    contentHash?: string;
    imageHash?: string;
  }): Promise<IPFSUploadResult> {
    const metadata: IdeaMetadata = {
      name: data.title,
      description: data.description,
      image: data.imageHash ? `ipfs://${data.imageHash}` : undefined,
      content: data.contentHash ? `ipfs://${data.contentHash}` : data.description,
      categories: data.categories,
      created_at: new Date().toISOString()
    };

    return this.uploadJSON(metadata, `${data.title}-idea-metadata.json`);
  }

  // Upload multiple files (for batch operations)
  async uploadMultipleFiles(files: { file: File | Blob; name: string }[]): Promise<IPFSUploadResult[]> {
    const uploads = await Promise.all(
      files.map(({ file, name }) => this.uploadFile(file, name))
    );

    return uploads;
  }

  // Get file from IPFS
  async getFile(hash: string): Promise<Response> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
      return response;
    } catch (error) {
      throw new Error(`Failed to retrieve file from IPFS: ${error}`);
    }
  }

  // Get JSON metadata from IPFS
  async getJSON(hash: string): Promise<any> {
    try {
      const response = await this.getFile(hash);
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to retrieve JSON from IPFS: ${error}`);
    }
  }

  // Pin existing hash (if you have content from another source)
  async pinByHash(hash: string, name?: string): Promise<void> {
    try {
      await this.pinata.pinning.pinByHash(hash, {
        pinataMetadata: {
          name: name || hash
        }
      });
    } catch (error) {
      throw new Error(`Failed to pin hash to IPFS: ${error}`);
    }
  }

  // List pinned files
  async listPinnedFiles(limit: number = 100) {
    try {
      const response = await this.pinata.pinning.listFiles({
        pageLimit: limit,
        status: 'pinned'
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to list pinned files: ${error}`);
    }
  }

  // Unpin file (careful with this!)
  async unpinFile(hash: string): Promise<void> {
    try {
      await this.pinata.pinning.unpin([hash]);
    } catch (error) {
      throw new Error(`Failed to unpin file: ${error}`);
    }
  }

  // Convert IPFS URL to HTTP gateway URL
  convertToGatewayUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }

  // Test Pinata connection
  async testConnection(): Promise<boolean> {
    try {
      await this.pinata.testAuthentication();
      return true;
    } catch (error) {
      console.error('Pinata connection test failed:', error);
      return false;
    }
  }
}