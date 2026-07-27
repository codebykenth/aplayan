<?php

namespace App\Enums;

enum JobApplicationStatus: string
{
    case Wishlist = 'wishlist';
    case Applied = 'applied';
    case Interviewing = 'interviewing';
    case Offer = 'offer';
    case Rejected = 'rejected';
    case Withdrawn = 'withdrawn';

    public function label(): string
    {
        return match ($this) {
            self::Wishlist => 'Wishlist',
            self::Applied => 'Applied',
            self::Interviewing => 'Interviewing',
            self::Offer => 'Offer',
            self::Rejected => 'Rejected',
            self::Withdrawn => 'Withdrawn',
        };
    }
}
