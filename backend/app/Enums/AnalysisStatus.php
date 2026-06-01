<?php

namespace App\Enums;

enum AnalysisStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
}
