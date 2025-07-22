import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

export class CryptoService {
  
  /**
   * Generate a random encryption key
   */
  static generateKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
  }
  
  /**
   * Encrypt data using AES-256-GCM
   */
  static encrypt(data: string, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipherGCM(ALGORITHM, keyBuffer, iv);
      cipher.setAAD(Buffer.from('idea-content', 'utf8')); // Additional authenticated data
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }
  
  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, key: string): string {
    try {
      const keyBuffer = Buffer.from(key, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipherGCM(ALGORITHM, keyBuffer, iv);
      decipher.setAAD(Buffer.from('idea-content', 'utf8')); // Same AAD as encryption
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
  
  /**
   * Encrypt JSON object
   */
  static encryptObject(obj: any, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, key);
  }
  
  /**
   * Decrypt to JSON object
   */
  static decryptObject(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, key: string): any {
    const decryptedString = this.decrypt(encryptedData, key);
    return JSON.parse(decryptedString);
  }
  
  /**
   * Create a purchase-specific encryption key from buyer address and idea ID
   * This ensures only the buyer can decrypt the content after purchase
   */
  static generatePurchaseKey(buyerAddress: string, ideaId: number, masterKey: string): string {
    const data = `${buyerAddress.toLowerCase()}-${ideaId}-${masterKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Encrypt idea content for storage
   * Returns encrypted content and metadata needed for decryption after purchase
   */
  static encryptIdeaContent(content: {
    description: string;
    fullContent?: string;
    attachments?: any[];
  }, ideaId: number) {
    // Generate a master key for this idea
    const masterKey = this.generateKey();
    
    // Encrypt the content
    const encryptedContent = this.encryptObject(content, masterKey);
    
    // Store the master key securely (in production, this should be stored separately)
    // For now, we'll include it in the response but it should be stored in a secure database
    
    return {
      encryptedContent,
      masterKey, // In production: store this securely, separate from IPFS
      ideaId,
      encrypted: true,
      encryptionMethod: ALGORITHM
    };
  }
  
  /**
   * Decrypt idea content after successful purchase
   */
  static decryptIdeaContent(encryptedData: {
    encryptedContent: {
      encrypted: string;
      iv: string;
      tag: string;
    };
    masterKey: string;
    ideaId: number;
  }, buyerAddress: string): any {
    
    // Generate buyer-specific key
    const purchaseKey = this.generatePurchaseKey(
      buyerAddress, 
      encryptedData.ideaId, 
      encryptedData.masterKey
    );
    
    // For this demo, we'll use the master key directly
    // In production, you'd verify the purchase on-chain first
    try {
      return this.decryptObject(encryptedData.encryptedContent, encryptedData.masterKey);
    } catch (error) {
      throw new Error(`Failed to decrypt content for buyer ${buyerAddress}: ${error.message}`);
    }
  }
}