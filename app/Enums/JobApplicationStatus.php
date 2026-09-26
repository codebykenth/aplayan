<?php

namespace App\Enums;

enum JobApplicationStatus: string
{
    case Wishlist = 'wishlist';
    case Applied = 'applied';
    case Interviewing = 'interviewing';
    case Interviewed = 'interviewed';
    case Offer = 'offer';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::Wishlist => 'Wishlist',
            self::Applied => 'Applied',
            self::Interviewing => 'Interviewing',
            self::Interviewed => 'Interviewed',
            self::Offer => 'Offer',
            self::Accepted => 'Accepted',
            self::Rejected => 'Rejected',
            self::Withdrawn => 'Withdrawn',
        };
    }
}
