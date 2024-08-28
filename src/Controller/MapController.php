<?php

namespace App\Controller;
use Symfony\UX\Map\Map;
use Symfony\UX\Map\Point;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MapController extends AbstractController
{
    

    #[Route('/map', name: 'map')]
    public function map(): Response
    {

        
        // Create a new map instance
        $myMap = (new Map())
            // Explicitly set the center and zoom
            ->center(new Point(46.903354, 1.888334))
            ->zoom(6)
        ;


        // Inject the map in your template to render it
        return $this->render('map/index.html.twig', [
            'map' => $myMap,
        ]);
    }
}
