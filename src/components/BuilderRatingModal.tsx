import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface Builder {
  id: number;
  name: string;
  username: string;
  avatar: string;
  avatarUrl?: string;
  address?: string;
  level: number;
  reputation: number;
  specialties: string[];
  achievements: string[];
  teamsFormed: number;
  ideasMinted: number;
  bgGradient: string;
  location: string;
  joinedDate: string;
  bio: string;
  skills: string[];
  currentProjects: number;
  followers: number;
  following: number;
  isOnline: boolean;
  featured: boolean;
  pixelColor: string;
  rating: number;
  totalRatings: number;
  userRating?: number;
}

interface BuilderRatingModalProps {
  builder: Builder | null;
  ideaId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const BuilderRatingModal: React.FC<BuilderRatingModalProps> = ({ builder, ideaId, isOpen, onClose }) => {
  const { showWarning, showSuccess, showError } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState('');

  if (!isOpen) {
    return null;
  }

  if (!builder) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 border-4 border-gray-800 max-w-lg w-full shadow-2xl">
          <div className="p-6 text-center">
            <h2 className="font-pixel font-bold text-pixel-lg text-red-600 uppercase tracking-wider mb-4">
              Error
            </h2>
            <p className="font-orbitron text-pixel-sm text-gray-700 mb-6">
              No builder data available.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 border-2 border-gray-700 font-pixel font-bold text-pixel-sm hover:bg-gray-600 transition-all duration-200 uppercase tracking-wider"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    setHoverRating(0);
  };

  const handleStarHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || selectedRating;

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      showWarning('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      setSubmissionStep('Submitting rating to blockchain...');
      
      // Mock blockchain call - simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmissionStep('Rating submitted successfully!');
      
      // Show success toast
      showSuccess(
        'Rating Submitted!', 
        `Successfully rated ${builder.name} ${selectedRating}/5 stars`
      );
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSelectedRating(0);
        setHoverRating(0);
        setReview('');
        setSubmissionStep('');
      }, 1500);
      
    } catch (error) {
      setSubmissionStep('Error: Failed to submit rating');
      showError('Submission Failed', 'Failed to submit rating. Please try again.');
      setTimeout(() => setSubmissionStep(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 border-4 border-gray-800 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b-4 border-gray-800 bg-gradient-to-r ${builder.pixelColor || 'from-blue-400 to-purple-500'}`}>
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-white" />
            <h2 className="font-pixel font-bold text-pixel-lg text-white uppercase tracking-wider">
              Rate Builder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 border-2 border-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Builder Info */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-100 border-2 border-gray-400">
            <div className="w-16 h-16 bg-gradient-to-br from-sunset-coral to-sky-blue border-2 border-gray-600 flex items-center justify-center text-2xl overflow-hidden">
              {builder.avatarUrl ? (
                <img 
                  src={builder.avatarUrl} 
                  alt={builder.name || 'Builder avatar'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${builder.avatarUrl ? 'hidden' : 'flex'}`}>
                {builder.avatar || '🦸‍♂️'}
              </div>
            </div>
            <div>
              <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 uppercase tracking-wider">{builder.name || 'Unknown Builder'}</h3>
              <p className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">{builder.username || '@unknown'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(builder.rating || 0) ? 'fill-current text-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-pixel text-pixel-xs text-gray-600 uppercase tracking-wider">
                  {builder.rating || 0} ({builder.totalRatings || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-3 uppercase tracking-wider">
              Rate this Builder
            </label>
            <div className="flex items-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= displayRating
                        ? 'fill-current text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="font-orbitron text-pixel-sm text-gray-600 uppercase tracking-wide">
              {displayRating === 0 && 'Click to rate'}
              {displayRating === 1 && 'Poor - Needs improvement'}
              {displayRating === 2 && 'Fair - Below average'}
              {displayRating === 3 && 'Good - Average performance'}
              {displayRating === 4 && 'Very Good - Above average'}
              {displayRating === 5 && 'Excellent - Outstanding work'}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block font-pixel font-bold text-pixel-sm text-gray-800 mb-2 uppercase tracking-wider">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/50 border-2 border-gray-600 font-orbitron text-pixel-sm focus:outline-none focus:border-moss-green pixel-input uppercase tracking-wide resize-none"
              placeholder="SHARE YOUR EXPERIENCE WORKING WITH THIS BUILDER..."
              maxLength={500}
            />
            <div className="text-right mt-1">
              <span className="font-orbitron text-pixel-xs text-gray-500 uppercase tracking-wide">
                {review.length}/500
              </span>
            </div>
          </div>

          {/* Status Display */}
          {submissionStep && (
            <div className="mb-4 p-3 bg-blue-100 border-2 border-blue-400">
              <div className="flex items-center space-x-2">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600"></div>
                ) : (
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                )}
                <span className="font-pixel text-pixel-sm text-blue-800 uppercase tracking-wider">
                  {submissionStep}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-400 text-white border-2 border-gray-600 font-pixel font-bold text-pixel-sm hover:bg-gray-500 transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CANCEL
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedRating === 0 || isSubmitting}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-moss-green to-sky-blue text-white px-6 py-3 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT RATING'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BuilderRatingModal;