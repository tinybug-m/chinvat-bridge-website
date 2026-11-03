-- Pricing: Scale is now the plan in the light, so the "Recommended" note moves to it from Growth.
update public.plans set highlighted = (id = 'scale');
