import { fetchAPI } from "@/lib/fetch";
import type {
  Document,
  DocumentType,
  DocumentStatus,
  UploadDocumentRequest,
  DocumentVerificationResult,
  DriverVerificationStatus,
  DocumentStatistics,
} from "@/types/driver";

export class DocumentService {
  // Get all documents for the current driver
  async getDocuments(): Promise<Document[]> {
    try {
      
      const response = await fetchAPI("driver/documents", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get a specific document by ID
  async getDocument(documentId: string): Promise<Document> {
    try {
      
      const response = await fetchAPI(`driver/documents/${documentId}`, {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Upload a new document
  async uploadDocument(request: UploadDocumentRequest): Promise<Document> {
    try {
      

      const formData = new FormData();

      // Handle file upload
      if (request.file instanceof File) {
        formData.append("file", request.file);
      } else {
        // For base64 strings, send as JSON
        formData.append("file", request.file);
      }

      formData.append("type", request.type);
      if (request.fileName) formData.append("fileName", request.fileName);
      if (request.description)
        formData.append("description", request.description);

      const response = await fetchAPI("driver/documents", {
        method: "POST",
        body: formData,
        requiresAuth: true,
        // Note: Don't set Content-Type header for FormData
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Update an existing document
  async updateDocument(
    documentId: string,
    updates: Partial<Document>,
  ): Promise<Document> {
    try {
      
      const response = await fetchAPI(`driver/documents/${documentId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      
      await fetchAPI(`driver/documents/${documentId}`, {
        method: "DELETE",
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Get driver verification status
  async getVerificationStatus(): Promise<DriverVerificationStatus> {
    try {
      
      const response = await fetchAPI("driver/verification-status", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get required document types
  async getRequiredDocumentTypes(): Promise<
    { type: DocumentType; name: string; description: string }[]
  > {
    try {
      
      const response = await fetchAPI("driver/document-types", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Re-upload a rejected document
  async reuploadDocument(
    documentId: string,
    file: File | string,
    fileName?: string,
  ): Promise<Document> {
    try {
      

      const formData = new FormData();

      if (file instanceof File) {
        formData.append("file", file);
      } else {
        formData.append("file", file);
      }

      if (fileName) formData.append("fileName", fileName);

      const response = await fetchAPI(
        `driver/documents/${documentId}/reupload`,
        {
          method: "POST",
          body: formData,
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get document verification history
  async getDocumentHistory(documentId: string): Promise<any[]> {
    try {
      
      const response = await fetchAPI(
        `driver/documents/${documentId}/history`,
        {
          requiresAuth: true,
        },
      );
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Request expedited verification
  async requestExpeditedVerification(
    documentId: string,
    priority: "normal" | "high" | "urgent",
  ): Promise<void> {
    try {
      
      await fetchAPI(`driver/documents/${documentId}/expedite`, {
        method: "POST",
        body: JSON.stringify({ priority }),
        requiresAuth: true,
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Get document download URL
  async getDocumentDownloadUrl(documentId: string): Promise<string> {
    try {
      
      const response = await fetchAPI(
        `driver/documents/${documentId}/download`,
        {
          requiresAuth: true,
        },
      );
      return response.url;
    } catch (error) {
      
      throw error;
    }
  }

  // Bulk upload multiple documents
  async bulkUploadDocuments(
    documents: UploadDocumentRequest[],
  ): Promise<Document[]> {
    try {
      

      const formData = new FormData();

      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][type]`, doc.type);
        if (doc.description) {
          formData.append(`documents[${index}][description]`, doc.description);
        }
        if (doc.fileName) {
          formData.append(`documents[${index}][fileName]`, doc.fileName);
        }

        if (doc.file instanceof File) {
          formData.append(`documents[${index}][file]`, doc.file);
        } else {
          formData.append(`documents[${index}][file]`, doc.file);
        }
      });

      const response = await fetchAPI("driver/documents/bulk", {
        method: "POST",
        body: formData,
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  // Get document statistics
  async getDocumentStatistics(): Promise<{
    totalDocuments: number;
    approvedDocuments: number;
    pendingDocuments: number;
    rejectedDocuments: number;
    expiredDocuments: number;
  }> {
    try {
      
      const response = await fetchAPI("driver/documents/statistics", {
        requiresAuth: true,
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();
