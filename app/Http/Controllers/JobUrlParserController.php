<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobUrlParserRequest;
use App\Services\JobUrlParserService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class JobUrlParserController extends Controller
{
    public function __construct(private JobUrlParserService $parser) {}

    public function parse(JobUrlParserRequest $request): JsonResponse
    {
        $jobUrl = $request->input('job_url');

        try {
            $result = $this->parser->parse($jobUrl);
        } catch (RequestException $e) {
            return response()->json(
                ['message' => 'Failed to fetch the job page. Please check the URL and try again.'],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        return response()->json($result);
    }
}
